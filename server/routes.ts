import type { Express } from "express";
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

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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
    } catch (error) {
      console.error('Delete produto error:', error);
      res.status(500).json({ error: 'Internal server error' });
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

  // Endpoint para buscar uma ordem específica com dados completos
  app.get('/api/ordens/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const ordem = await storage.getOrdemServico(id, req.userId!);
      if (!ordem) {
        return res.status(404).json({ error: 'Ordem not found' });
      }
      res.json(ordem);
    } catch (error) {
      console.error('Get ordem by id error:', error);
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
      const statusAnterior = ordemAnterior?.status;
      const novoStatus = ordemData.status;
      
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
          const cliente = await storage.getCliente(ordem.cliente_id, req.userId!);
          const entradaFinanceira = {
            user_id: req.userId!,
            tipo: 'receita' as const,
            descricao: `Serviço realizado - OS #${ordem.numero || ordem.id.slice(0, 8)}`,
            valor: ordem.valor_total.toString(),
            categoria: 'Serviços',
            forma_pagamento: 'dinheiro' as const,
            data_vencimento: new Date().toISOString().split('T')[0],
            status_pagamento: 'pago' as const,
            observacoes: `Cliente: ${cliente?.nome || 'N/A'} - Equipamento: ${ordem.tipo_equipamento} ${ordem.marca} ${ordem.modelo}`,
            parcelas: 1,
            parcela_atual: 1,
            valor_parcela: ordem.valor_total.toString(),
            centro_custo: '',
            conta_bancaria: '',
            numero_documento: '',
            pessoa_responsavel: ''
          };
          
          await storage.createEntradaFinanceira(entradaFinanceira);
          console.log(`Entrada financeira criada automaticamente para OS ${ordem.id}`);
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
      await storage.deleteOrdemServico(id, req.userId!);
      res.json({ message: 'Ordem deleted successfully' });
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
