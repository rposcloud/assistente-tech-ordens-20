import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertProfileSchema, insertClienteSchema, 
  insertProdutoSchema, insertOrdemServicoSchema, insertEntradaFinanceiraSchema,
  produtosUtilizados, pecasUtilizadas 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  // Em produção, forçar erro se JWT_SECRET não estiver configurado
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  console.warn("⚠️ JWT_SECRET não configurado. Usando chave temporária para desenvolvimento.");
  return 'dev-secret-key-' + Math.random().toString(36).substring(2, 15);
})();

// Criar diretório de uploads se não existir
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer para upload de arquivos
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Lista branca de tipos MIME seguros
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos JPG, PNG e WebP são permitidos'));
    }
  }
});

// Middleware for authentication
interface AuthRequest extends Request {
  userId?: string;
}

const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Debug logs removidos para produção
  
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Servir arquivos estáticos da pasta uploads
  app.use('/uploads', express.static(uploadDir));

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET!, { expiresIn: '24h' });
      const profile = await storage.getProfile(user.id);

      res.json({ 
        user: { id: user.id, email: user.email },
        profile,
        token 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { 
        email, 
        password, 
        fullName,
        // Dados opcionais da empresa
        nomeEmpresa,
        cnpj,
        telefone,
        endereco,
        cidade,
        estado,
        cep
      } = req.body;
      
      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Email, password and full name required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await storage.hashPassword(password);
      
      const userData = insertUserSchema.parse({
        email,
        password_hash: hashedPassword
      });

      const user = await storage.createUser(userData);
      
      // Create profile with optional company data
      const profileData = insertProfileSchema.parse({
        id: user.id,
        nome_completo: fullName,
        nome_empresa: nomeEmpresa || null,
        cnpj: cnpj || null,
        telefone: telefone || null,
        endereco: endereco || null,
        cidade: cidade || null,
        estado: estado || null,
        cep: cep || null
      });
      
      const profile = await storage.createProfile(profileData);

      // Create default categories
      await createDefaultCategories(user.id);

      const token = jwt.sign({ userId: user.id }, JWT_SECRET!, { expiresIn: '24h' });

      res.json({ 
        user: { id: user.id, email: user.email },
        profile,
        token 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  // Profile routes
  app.get('/api/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.userId!);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const profileData = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(req.userId!, profileData);
      res.json(profile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Upload de logo da empresa
  app.post('/api/profile/upload-logo', authenticateToken, upload.single('logo'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      // Deletar logo anterior se existir
      const currentProfile = await storage.getProfile(req.userId!);
      if (currentProfile?.logo_url) {
        const oldLogoPath = path.join(uploadDir, path.basename(currentProfile.logo_url));
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }

      // Atualizar profile com nova URL da logo
      const logoUrl = `/uploads/${req.file.filename}`;
      const profile = await storage.updateProfile(req.userId!, { logo_url: logoUrl });

      res.json({ 
        message: 'Logo enviada com sucesso',
        logo_url: logoUrl,
        profile 
      });
    } catch (error) {
      console.error('Upload logo error:', error);
      
      // Deletar arquivo se houver erro
      if (req.file) {
        const filePath = path.join(uploadDir, req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Deletar logo da empresa
  app.delete('/api/profile/logo', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const currentProfile = await storage.getProfile(req.userId!);
      if (currentProfile?.logo_url) {
        // Deletar arquivo físico
        const logoPath = path.join(uploadDir, path.basename(currentProfile.logo_url));
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
        }

        // Remover URL do banco
        const profile = await storage.updateProfile(req.userId!, { logo_url: undefined });
        res.json({ 
          message: 'Logo removida com sucesso',
          profile 
        });
      } else {
        res.json({ message: 'Nenhuma logo para remover' });
      }
    } catch (error) {
      console.error('Delete logo error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Clientes routes
  app.get('/api/clientes', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const clientes = await storage.getClientes(req.userId!);
      res.json(clientes);
    } catch (error) {
      console.error('Get clientes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/clientes', authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Filtrar campos vazios antes da validação
      const cleanedData = Object.fromEntries(
        Object.entries(req.body).filter(([key, value]) => {
          // Remover campos vazios ou apenas com espaços
          if (typeof value === 'string' && value.trim() === '') {
            return false;
          }
          return true;
        })
      );

      const clienteData = insertClienteSchema.parse(cleanedData);
      const cliente = await storage.createCliente(clienteData, req.userId!);
      res.json(cliente);
    } catch (error) {
      console.error('Create cliente error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/clientes/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      // Filtrar campos vazios antes da validação
      const cleanedData = Object.fromEntries(
        Object.entries(req.body).filter(([key, value]) => {
          // Remover campos vazios ou apenas com espaços
          if (typeof value === 'string' && value.trim() === '') {
            return false;
          }
          return true;
        })
      );

      const clienteData = insertClienteSchema.partial().parse(cleanedData);
      const cliente = await storage.updateCliente(id, req.userId!, clienteData);
      res.json(cliente);
    } catch (error) {
      console.error('Update cliente error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/clientes/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCliente(id, req.userId!);
      res.json({ message: 'Cliente deleted successfully' });
    } catch (error) {
      console.error('Delete cliente error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Produtos routes
  app.get('/api/produtos', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const produtos = await storage.getProdutos(req.userId!);
      res.json(produtos);
    } catch (error) {
      console.error('Get produtos error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/produtos', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const produtoData = insertProdutoSchema.parse({
        ...req.body,
        user_id: req.userId!
      });
      const produto = await storage.createProduto(produtoData);
      res.json(produto);
    } catch (error) {
      console.error('Create produto error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/produtos/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const produtoData = insertProdutoSchema.partial().parse(req.body);
      const produto = await storage.updateProduto(id, req.userId!, produtoData);
      res.json(produto);
    } catch (error) {
      console.error('Update produto error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/produtos/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduto(id, req.userId!);
      res.json({ message: 'Produto inativado com sucesso' });
    } catch (error) {
      console.error('Delete produto error:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  });

  // Ordens de Serviço routes
  app.get('/api/ordens', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const ordens = await storage.getOrdensServico(req.userId!);
      res.json(ordens);
    } catch (error) {
      console.error('Get ordens error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/ordens', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { produtos_utilizados, ...dadosOrdem } = req.body;
      const ordemData = insertOrdemServicoSchema.parse({
        ...dadosOrdem,
        user_id: req.userId!
      });
      
      const ordem = await storage.createOrdemServico(ordemData, req.userId!);
      
      // Processar produtos utilizados se fornecidos
      if (produtos_utilizados && Array.isArray(produtos_utilizados)) {
        for (const produto of produtos_utilizados) {
          if (produto.produto_id) {
            // É um produto cadastrado
            await storage.addProdutoUtilizado(
              ordem.id, 
              produto.produto_id, 
              produto.quantidade, 
              produto.valor_unitario
            );
          } else if (produto.nome) {
            // É uma peça avulsa
            await storage.addPecaUtilizada(
              ordem.id, 
              produto.nome, 
              produto.quantidade, 
              produto.valor_unitario
            );
          }
        }
      }
      
      res.json(ordem);
    } catch (error) {
      console.error('Create ordem error:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  app.put('/api/ordens/:id', authenticateToken, async (req: AuthRequest, res) => {
    // Debug log removido para produção
    try {
      const { id } = req.params;
      const { produtos_utilizados, ...dadosOrdem } = req.body;
      
      // Logs sensíveis removidos para produção
      
      const ordemData = insertOrdemServicoSchema.partial().parse(dadosOrdem);
      
      // Verificar se o status está sendo alterado para "entregue"
      const ordemAnterior = await storage.getOrdemServico(id, req.userId!);
      if (!ordemAnterior) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }
      
      const statusAnterior = ordemAnterior.status;
      const novoStatus = ordemData.status;

      // Verificar proteção financeira robusta
      const protection = await checkFinancialProtection(id, req.userId!);
      
      // Validar alterações para OS protegidas
      const validation = validateProtectedOSChanges(
        protection, 
        ordemAnterior, 
        ordemData, 
        novoStatus && novoStatus !== statusAnterior ? 'status_change' : 'update'
      );
      
      if (!validation.allowed) {
        return res.status(423).json({
          error: 'Operação não permitida - OS financeiramente protegida',
          protection_status: {
            protected: true,
            linked_entries: protection.count,
            total_value: protection.totalValue
          },
          validation_errors: validation.errors,
          message: 'Esta OS possui vínculos financeiros que impedem esta alteração',
          suggestion: 'Gerencie as entradas financeiras vinculadas antes de alterar a OS'
        });
      }
      
      const ordem = await storage.updateOrdemServico(id, req.userId!, ordemData);
      
      // Criar entrada financeira automaticamente quando OS é finalizada
      if (novoStatus === 'finalizada' && statusAnterior !== 'finalizada') {
        console.log('OS sendo finalizada! Status anterior:', statusAnterior, 'Novo status:', novoStatus);
        console.log('Valor total da OS:', ordem.valor_total);
        
        // Verificar se já não existe entrada financeira para esta OS
        const entradasExistentes = await storage.getEntradasFinanceiras(req.userId!);
        const jaTemEntrada = entradasExistentes.some(entrada => entrada.ordem_servico_id === id);
        
        console.log('Já tem entrada financeira?', jaTemEntrada);
        
        if (!jaTemEntrada && ordem.valor_total) {
          // Buscar categoria padrão de receita
          const categorias = await storage.getCategoriasFinanceiras(req.userId!);
          const categoriaReceita = categorias.find(cat => cat.nome.toLowerCase().includes('receita') || cat.nome.toLowerCase().includes('vendas') || cat.nome.toLowerCase().includes('servico'));
          
          console.log('Categorias encontradas:', categorias.length);
          console.log('Categoria selecionada:', categoriaReceita?.nome || categorias[0]?.nome);
          
          try {
            const categoriaSelecionada = categoriaReceita || categorias[0];
            const entradaData = {
              descricao: `Receita da OS #${ordem.numero}`,
              valor: ordem.valor_total as string,
              tipo: 'receita' as const,
              categoria_id: categoriaSelecionada?.id,
              categoria: categoriaSelecionada?.nome || 'Serviços de Reparo',
              ordem_servico_id: id,
              data_vencimento: new Date().toISOString().split('T')[0],
              status_pagamento: 'pago' as const,
              forma_pagamento: 'dinheiro' as const,
              user_id: req.userId!
            };
            
            console.log('Criando entrada financeira:', entradaData);
            const entradaCriada = await storage.createEntradaFinanceira(entradaData);
            console.log('Entrada financeira criada com sucesso:', entradaCriada.id);
          } catch (error) {
            console.error('Erro ao criar entrada financeira automática:', error);
          }
        }
      }
      
      // Processar produtos utilizados se fornecidos
      if (produtos_utilizados && Array.isArray(produtos_utilizados)) {
        console.log('🔧 Server: Atualizando produtos da OS', id);
        console.log('📦 Server: Produtos recebidos:', {
          quantidade: produtos_utilizados.length,
          detalhes: produtos_utilizados
        });
        
        // Primeiro, remover todos os produtos existentes
        console.log('🗑️ Server: Removendo produtos existentes');
        await db.delete(produtosUtilizados).where(eq(produtosUtilizados.ordem_servico_id, id));
        await db.delete(pecasUtilizadas).where(eq(pecasUtilizadas.ordem_servico_id, id));
        
        // Inserir novos produtos
        console.log('💾 Server: Inserindo novos produtos');
        for (const produto of produtos_utilizados) {
          if (produto.produto_id) {
            // Produto cadastrado (tem produto_id)
            console.log('➕ Server: Adicionando produto cadastrado:', produto);
            await storage.addProdutoUtilizado(
              id, 
              produto.produto_id, 
              produto.quantidade, 
              produto.valor_unitario
            );
          } else {
            // Peça avulsa (não tem produto_id)
            console.log('➕ Server: Adicionando peça avulsa:', produto);
            await storage.addPecaUtilizada(
              id, 
              produto.nome, 
              produto.quantidade, 
              produto.valor_unitario
            );
          }
        }
        console.log('✅ Server: Produtos atualizados com sucesso');
      }
      
      // Buscar ordem atualizada com produtos para retornar dados completos
      const ordemCompleta = await storage.getOrdemServico(id, req.userId!);
      console.log('📤 Server: Retornando ordem atualizada:', {
        id: ordemCompleta?.id,
        produtos_utilizados: (ordemCompleta as any)?.produtos_utilizados?.length || 0,
        produtos_detalhes: (ordemCompleta as any)?.produtos_utilizados
      });
      
      res.json(ordemCompleta);
    } catch (error) {
      console.error('Update ordem error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/ordens/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { force, action } = req.query;
      
      // Verificar se a OS existe
      const ordem = await storage.getOrdemServico(id, req.userId!);
      if (!ordem) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }

      // Verificar proteção financeira robusta
      const protection = await checkFinancialProtection(id, req.userId!);
      
      // Validar operação de exclusão
      const validation = validateProtectedOSChanges(protection, ordem, {}, 'delete');
      
      // Se a OS está protegida e não foi forçada a exclusão
      if (!validation.allowed && !force) {
        return res.status(423).json({
          error: 'Exclusão não permitida - OS financeiramente protegida',
          protection_status: {
            protected: true,
            linked_entries: protection.count,
            total_value: protection.totalValue
          },
          validation_errors: validation.errors,
          options: {
            delete_all: `DELETE /api/ordens/${id}?force=true&action=delete_financial`,
            unlink_keep: `DELETE /api/ordens/${id}?force=true&action=keep_financial`
          },
          message: 'Esta OS possui vínculos financeiros. Escolha uma das opções disponíveis.',
          linked_entries: protection.linkedEntries.map(e => ({
            id: e.id,
            valor: e.valor,
            descricao: e.descricao,
            data_vencimento: e.data_vencimento
          }))
        });
      }

      // Processar exclusão forçada com ação específica
      if (force && protection.hasProtection) {
        if (action === 'delete_financial') {
          // Excluir entradas financeiras vinculadas
          for (const entrada of protection.linkedEntries) {
            await storage.deleteEntradaFinanceira(entrada.id, req.userId!);
          }
        } else if (action === 'keep_financial') {
          // Desvincular entradas (manter como entrada independente)
          for (const entrada of protection.linkedEntries) {
            await storage.updateEntradaFinanceira(entrada.id, req.userId!, {
              ordem_servico_id: null,
              observacoes: (entrada.observacoes || '') + ' [OS original excluída - entrada mantida]'
            });
          }
        }
      }

      // Excluir a ordem de serviço
      await storage.deleteOrdemServico(id, req.userId!);
      
      res.json({ 
        success: true,
        message: 'OS excluída com sucesso',
        protection_info: {
          was_protected: protection.hasProtection,
          entries_processed: protection.count,
          action_taken: force ? action : 'none'
        }
      });
    } catch (error) {
      console.error('Delete ordem error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Endpoint para impressão com dados completos
  app.get('/api/ordens/:id/print', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const ordem = await storage.getOrdemServico(id, req.userId!);
      if (!ordem) {
        return res.status(404).json({ error: 'Ordem not found' });
      }
      
      // Debug: verificar estrutura dos dados
      const ordemCompleta = ordem as any;
      console.log('=== DEBUG ORDEM ===');
      console.log('Ordem ID:', id);
      console.log('Produtos utilizados:', ordemCompleta.produtos_utilizados);
      console.log('Peças utilizadas:', ordemCompleta.pecas_utilizadas);
      console.log('Cliente:', ordemCompleta.clientes);
      
      // Retornar dados formatados para impressão
      res.json({
        ordem: {
          ...ordem,
          cliente: ordemCompleta.clientes,
          produtos_utilizados: ordemCompleta.produtos_utilizados || [],
          pecas_utilizadas: ordemCompleta.pecas_utilizadas || []
        },
        empresa: ordemCompleta.empresa
      });
    } catch (error) {
      console.error('Get ordem for print error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Portal do cliente (acesso público via token)
  app.get('/api/portal/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const ordem = await storage.getOrdemServicoByToken(token);
      
      if (!ordem) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Verificar se o token não expirou
      if (ordem.link_expires_at && new Date(ordem.link_expires_at) < new Date()) {
        return res.status(410).json({ error: 'Link expired' });
      }

      res.json(ordem);
    } catch (error) {
      console.error('Portal access error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Verificar se existe entrada financeira vinculada a uma ordem específica
  // Endpoint para validar proteções financeiras
  app.get('/api/ordens/:id/protection-status', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se a OS existe
      const ordem = await storage.getOrdemServico(id, req.userId!);
      if (!ordem) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }

      // Verificar proteção financeira
      const protection = await checkFinancialProtection(id, req.userId!);
      
      res.json({
        ordem_id: id,
        numero: ordem.numero,
        status: ordem.status,
        valor_total: ordem.valor_total,
        protection: {
          is_protected: protection.hasProtection,
          linked_entries_count: protection.count,
          total_linked_value: protection.totalValue,
          can_edit_value: !protection.hasProtection || ordem.status !== 'finalizada',
          can_change_status: !protection.hasProtection || ordem.status !== 'finalizada',
          can_delete: !protection.hasProtection
        },
        linked_entries: protection.linkedEntries.map(e => ({
          id: e.id,
          descricao: e.descricao,
          valor: e.valor,
          data_vencimento: e.data_vencimento,
          tipo: e.tipo
        }))
      });
    } catch (error) {
      console.error('Protection status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/financeiro/check-ordem/:ordemId', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { ordemId } = req.params;
      const entradas = await storage.getEntradasFinanceiras(req.userId!);
      const entradaVinculada = entradas.find(entrada => entrada.ordem_servico_id === ordemId);
      
      res.json({
        hasFinancialEntry: !!entradaVinculada,
        financialEntry: entradaVinculada || null
      });
    } catch (error) {
      console.error('Check financial entry error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Entradas Financeiras routes
  app.get('/api/financeiro', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const entradas = await storage.getEntradasFinanceiras(req.userId!);
      res.json(entradas);
    } catch (error) {
      console.error('Get entradas financeiras error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/financeiro', authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Log sensível removido para produção
      
      const entradaData = insertEntradaFinanceiraSchema.parse({
        ...req.body,
        user_id: req.userId!
      });
      
      console.log('Dados validados:', entradaData);
      
      const entrada = await storage.createEntradaFinanceira(entradaData);
      res.json(entrada);
    } catch (error) {
      console.error('Create entrada financeira error:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  app.put('/api/financeiro/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const entradaData = insertEntradaFinanceiraSchema.partial().parse(req.body);
      const entrada = await storage.updateEntradaFinanceira(id, req.userId!, entradaData);
      res.json(entrada);
    } catch (error) {
      console.error('Update entrada financeira error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/financeiro/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEntradaFinanceira(id, req.userId!);
      res.json({ message: 'Entrada financeira deleted successfully' });
    } catch (error) {
      console.error('Delete entrada financeira error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Categorias Financeiras routes
  app.get('/api/categorias-financeiras', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const categorias = await storage.getCategoriasFinanceiras(req.userId!);
      res.json(categorias);
    } catch (error) {
      console.error('Get categorias financeiras error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Tipos de Defeito routes
  app.get('/api/tipos-defeito', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const tipos = await storage.getTiposDefeito(req.userId!);
      res.json(tipos);
    } catch (error) {
      console.error('Get tipos defeito error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Produtos Utilizados
  app.post('/api/ordens/:id/produtos', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { produtoId, quantidade, valorUnitario } = req.body;
      
      const produtoUtilizado = await storage.addProdutoUtilizado(id, produtoId, quantidade, valorUnitario);
      res.json(produtoUtilizado);
    } catch (error) {
      console.error('Add produto utilizado error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/produtos-utilizados/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.removeProdutoUtilizado(id);
      res.json({ message: 'Produto utilizado removido com sucesso' });
    } catch (error) {
      console.error('Remove produto utilizado error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Peças Utilizadas
  app.post('/api/ordens/:id/pecas', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { nome, quantidade, valorUnitario } = req.body;
      
      const pecaUtilizada = await storage.addPecaUtilizada(id, nome, quantidade, valorUnitario);
      res.json(pecaUtilizada);
    } catch (error) {
      console.error('Add peca utilizada error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/pecas-utilizadas/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.removePecaUtilizada(id);
      res.json({ message: 'Peça utilizada removida com sucesso' });
    } catch (error) {
      console.error('Remove peca utilizada error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Servir arquivos estáticos da pasta uploads
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Arquivo não encontrado' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to create default categories
// Função auxiliar para verificar proteções financeiras
async function checkFinancialProtection(ordemId: string, userId: string) {
  const entradas = await storage.getEntradasFinanceiras(userId);
  const entradasVinculadas = entradas.filter(entrada => entrada.ordem_servico_id === ordemId);
  
  return {
    hasProtection: entradasVinculadas.length > 0,
    linkedEntries: entradasVinculadas,
    count: entradasVinculadas.length,
    totalValue: entradasVinculadas.reduce((acc, entrada) => {
      const valor = typeof entrada.valor === 'string' ? parseFloat(entrada.valor) : entrada.valor;
      return acc + (valor || 0);
    }, 0)
  };
}

// Função para validar alterações em OS protegidas
function validateProtectedOSChanges(
  protection: any, 
  currentOS: any, 
  updates: any, 
  operation: 'update' | 'delete' | 'status_change'
) {
  if (!protection.hasProtection) {
    return { allowed: true };
  }

  const errors = [];
  
  // Proteção contra alteração de valor total
  if (operation === 'update' && updates.valor_total && updates.valor_total !== currentOS.valor_total) {
    errors.push({
      field: 'valor_total',
      error: 'Valor total não pode ser alterado',
      reason: 'OS possui entradas financeiras vinculadas',
      current_value: currentOS.valor_total,
      attempted_value: updates.valor_total
    });
  }

  // Proteção contra alteração de status de finalizada
  if (operation === 'status_change' && currentOS.status === 'finalizada' && updates.status !== 'finalizada') {
    errors.push({
      field: 'status',
      error: 'Status não pode ser alterado',
      reason: 'OS finalizada possui entradas financeiras vinculadas',
      current_status: currentOS.status,
      attempted_status: updates.status
    });
  }

  // Proteção contra exclusão
  if (operation === 'delete') {
    errors.push({
      operation: 'delete',
      error: 'OS não pode ser excluída',
      reason: 'OS possui entradas financeiras vinculadas',
      linked_entries: protection.count,
      total_value: protection.totalValue
    });
  }

  return {
    allowed: errors.length === 0,
    errors,
    protection
  };
}

async function createDefaultCategories(userId: string) {
  try {
    // Default financial categories
    const receitas = [
      'Serviços de Reparo',
      'Venda de Peças',
      'Consultoria Técnica',
      'Outros Serviços'
    ];

    const despesas = [
      'Compra de Peças',
      'Aluguel',
      'Energia Elétrica',
      'Telefone/Internet',
      'Material de Escritório',
      'Outras Despesas'
    ];

    for (const nome of receitas) {
      await storage.createCategoriaFinanceira({
        user_id: userId,
        nome,
        tipo: 'receita'
      });
    }

    for (const nome of despesas) {
      await storage.createCategoriaFinanceira({
        user_id: userId,
        nome,
        tipo: 'despesa'
      });
    }

    // Default defect types
    const defeitosSmartphone = [
      'Tela quebrada',
      'Não liga',
      'Bateria viciada',
      'Problema no carregamento',
      'Câmera não funciona',
      'Áudio/Microfone'
    ];

    const defeitosNotebook = [
      'Tela quebrada',
      'Não liga',
      'Superaquecimento',
      'Teclado com defeito',
      'HD/SSD com problema',
      'Problema de memória RAM'
    ];

    for (const nome of defeitosSmartphone) {
      await storage.createTipoDefeito({
        user_id: userId,
        nome,
        tipo_equipamento: 'smartphone'
      });
    }

    for (const nome of defeitosNotebook) {
      await storage.createTipoDefeito({
        user_id: userId,
        nome,
        tipo_equipamento: 'notebook'
      });
    }
  } catch (error) {
    console.error('Error creating default categories:', error);
  }
}
