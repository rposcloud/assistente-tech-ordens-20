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

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

// Middleware for authentication
interface AuthRequest extends Request {
  userId?: string;
}

const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
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
      const { email, password, fullName } = req.body;
      
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
      
      // Create profile
      const profileData = insertProfileSchema.parse({
        id: user.id,
        nome_completo: fullName
      });
      
      const profile = await storage.createProfile(profileData);

      // Create default categories
      await createDefaultCategories(user.id);

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

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
      const clienteData = insertClienteSchema.parse(req.body);
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
      const clienteData = insertClienteSchema.partial().parse(req.body);
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
      res.json({ message: 'Produto deleted successfully' });
    } catch (error: any) {
      console.error('Delete produto error:', error);
      
      // Verificar se é erro de chave estrangeira (produto em uso)
      if (error.message?.includes('foreign key') || error.message?.includes('constraint') || error.code === '23503') {
        res.status(400).json({ 
          erro: 'Este produto não pode ser excluído pois está sendo usado em uma ou mais ordens de serviço. Remova-o das ordens primeiro.' 
        });
      } else {
        res.status(500).json({ erro: 'Erro interno do servidor' });
      }
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
      console.log('Dados recebidos para ordem:', req.body);
      console.log('User ID:', req.userId);
      
      const { produtos_utilizados, ...dadosOrdem } = req.body;
      const ordemData = insertOrdemServicoSchema.parse({
        ...dadosOrdem,
        user_id: req.userId!
      });
      
      console.log('Dados validados para ordem:', ordemData);
      
      const ordem = await storage.createOrdemServico(ordemData, req.userId!);
      
      // Processar produtos utilizados se fornecidos
      if (produtos_utilizados && Array.isArray(produtos_utilizados)) {
        console.log('Salvando produtos utilizados:', produtos_utilizados);
        
        for (const produto of produtos_utilizados) {
          if (produto.tipo === 'produto' && produto.produto_id) {
            await storage.addProdutoUtilizado(
              ordem.id, 
              produto.produto_id, 
              produto.quantidade, 
              produto.valor_unitario
            );
            console.log(`Produto adicionado: ${produto.nome}`);
          } else if (produto.tipo === 'peca_avulsa') {
            await storage.addPecaUtilizada(
              ordem.id, 
              produto.nome, 
              produto.quantidade, 
              produto.valor_unitario
            );
            console.log(`Peça avulsa adicionada: ${produto.nome}`);
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
    try {
      const { id } = req.params;
      const { produtos_utilizados, ...dadosOrdem } = req.body;
      const ordemData = insertOrdemServicoSchema.partial().parse(dadosOrdem);
      
      // Verificar se o status está sendo alterado para "entregue"
      const ordemAnterior = await storage.getOrdemServico(id, req.userId!);
      if (!ordemAnterior) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }
      
      const statusAnterior = ordemAnterior.status;
      const novoStatus = ordemData.status;

      // Verificar se há entradas financeiras vinculadas
      const entradasVinculadas = await storage.getEntradasFinanceiras(req.userId!);
      const entradasDaOS = entradasVinculadas.filter(entrada => entrada.ordem_servico_id === id);
      
      // Proteção: Se alterar valor total e houver entradas financeiras
      if (entradasDaOS.length > 0 && ordemData.valor_total && ordemData.valor_total !== ordemAnterior.valor_total) {
        return res.status(400).json({
          error: 'Não é possível alterar o valor total desta OS',
          motivo: 'Esta OS possui entradas financeiras vinculadas',
          entradas_vinculadas: entradasDaOS.length,
          valor_atual: ordemAnterior.valor_total,
          valor_tentativa: ordemData.valor_total,
          sugestao: 'Para alterar o valor, primeiro desvincule ou ajuste as entradas financeiras relacionadas'
        });
      }

      // Proteção: Se alterar status de "entregue" para outro e houver entradas financeiras
      if (statusAnterior === 'entregue' && novoStatus && novoStatus !== 'entregue' && entradasDaOS.length > 0) {
        return res.status(400).json({
          error: 'Não é possível alterar o status desta OS finalizada',
          motivo: 'Esta OS possui entradas financeiras vinculadas e já foi entregue',
          entradas_vinculadas: entradasDaOS.length,
          sugestao: 'Para reabrir esta OS, primeiro trate as entradas financeiras associadas'
        });
      }
      
      const ordem = await storage.updateOrdemServico(id, req.userId!, ordemData);
      
      // Processar produtos utilizados se fornecidos
      if (produtos_utilizados && Array.isArray(produtos_utilizados)) {
        // Primeiro, remover todos os produtos existentes
        await db.delete(produtosUtilizados).where(eq(produtosUtilizados.ordem_servico_id, id));
        await db.delete(pecasUtilizadas).where(eq(pecasUtilizadas.ordem_servico_id, id));
        
        // Inserir novos produtos
        for (const produto of produtos_utilizados) {
          if (produto.tipo === 'produto' && produto.produto_id) {
            await storage.addProdutoUtilizado(
              id, 
              produto.produto_id, 
              produto.quantidade, 
              produto.valor_unitario
            );
          } else if (produto.tipo === 'peca_avulsa') {
            await storage.addPecaUtilizada(
              id, 
              produto.nome, 
              produto.quantidade, 
              produto.valor_unitario
            );
          }
        }
      }
      
      // Se a ordem foi marcada como entregue, criar entrada financeira automaticamente
      const valorTotal = typeof ordem.valor_total === 'string' ? parseFloat(ordem.valor_total) : Number(ordem.valor_total);
      if (novoStatus === 'entregue' && statusAnterior !== 'entregue' && valorTotal > 0) {
        try {
          // Verificar se já existe entrada financeira para esta OS
          const entradasExistentes = await storage.getEntradasFinanceiras(req.userId!);
          const jaExisteEntrada = entradasExistentes.some(entrada => entrada.ordem_servico_id === ordem.id);
          
          if (!jaExisteEntrada) {
            const cliente = await storage.getCliente(ordem.cliente_id, req.userId!);
            
            const entradaFinanceira = {
              user_id: req.userId!,
              ordem_servico_id: ordem.id,
              tipo: 'receita' as 'receita',
              descricao: `OS #${ordem.numero || ordem.id.slice(0, 8)} - ${cliente?.nome || 'Cliente'}`,
              valor: valorTotal.toString(),
              categoria: 'Serviços de Reparo',
              forma_pagamento: (ordemData.forma_pagamento || 'dinheiro') as 'dinheiro',
              data_vencimento: ordemData.data_pagamento ? ordemData.data_pagamento.toString().split('T')[0] : new Date().toISOString().split('T')[0],
              status_pagamento: (ordemData.forma_pagamento === 'dinheiro' ? 'pago' : 'pendente') as 'pago' | 'pendente',
              observacoes: `Finalização automática - Equipamento: ${ordem.tipo_equipamento || ''} ${ordem.marca || ''} ${ordem.modelo || ''}`.trim()
            };
            
            await storage.createEntradaFinanceira(entradaFinanceira);
            console.log(`Entrada financeira criada automaticamente para OS ${ordem.id}`);
          } else {
            console.log(`Entrada financeira já existe para OS ${ordem.id}, pulando criação`);
          }
        } catch (financeiroError) {
          console.error('Erro ao criar entrada financeira automática:', financeiroError);
          // Não falha a atualização da ordem se houver erro no financeiro
        }
      }
      
      res.json(ordem);
    } catch (error) {
      console.error('Update ordem error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/ordens/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { force } = req.query; // Parâmetro para forçar exclusão
      
      // Verificar se a OS existe e obter detalhes
      const ordem = await storage.getOrdemServico(id, req.userId!);
      if (!ordem) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }

      // Verificar se existem entradas financeiras vinculadas a esta OS
      const entradasVinculadas = await storage.getEntradasFinanceiras(req.userId!);
      const entradasDaOS = entradasVinculadas.filter(entrada => entrada.ordem_servico_id === id);
      
      if (entradasDaOS.length > 0 && !force) {
        return res.status(400).json({ 
          error: 'Esta OS possui entradas financeiras vinculadas',
          entradas_vinculadas: entradasDaOS.length,
          detalhes: 'Para excluir esta OS, você deve primeiro decidir o que fazer com as entradas financeiras associadas.',
          opcoes: {
            excluir_financeiro: 'DELETE /api/ordens/' + id + '?force=true&action=delete_financial',
            manter_financeiro: 'DELETE /api/ordens/' + id + '?force=true&action=keep_financial'
          }
        });
      }

      // Se force=true, processar baseado na ação
      if (force) {
        const action = req.query.action as string;
        
        if (action === 'delete_financial') {
          // Excluir entradas financeiras vinculadas primeiro
          for (const entrada of entradasDaOS) {
            await storage.deleteEntradaFinanceira(entrada.id, req.userId!);
          }
          console.log(`${entradasDaOS.length} entradas financeiras excluídas junto com OS ${id}`);
        } else if (action === 'keep_financial') {
          // Desvincular entradas financeiras (remover ordem_servico_id)
          for (const entrada of entradasDaOS) {
            await storage.updateEntradaFinanceira(entrada.id, req.userId!, {
              ordem_servico_id: null,
              observacoes: (entrada.observacoes || '') + ' [OS original excluída]'
            });
          }
          console.log(`${entradasDaOS.length} entradas financeiras desvinculadas da OS ${id}`);
        }
      }

      // Excluir a ordem de serviço
      await storage.deleteOrdemServico(id, req.userId!);
      
      res.json({ 
        message: 'Ordem excluída com sucesso',
        entradas_processadas: entradasDaOS.length,
        acao_financeiro: force ? req.query.action : 'nenhuma'
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
      
      // Retornar dados formatados para impressão
      res.json({
        ordem: {
          ...ordem,
          cliente: ordem.clientes,
          produtos_utilizados: ordem.produtos_utilizados || [],
          pecas_utilizadas: ordem.pecas_utilizadas || []
        },
        empresa: ordem.empresa
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
      console.log('Dados recebidos para entrada financeira:', req.body);
      
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
