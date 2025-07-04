import { 
  users, clientes, produtos, ordensServico, entradasFinanceiras, 
  categoriasFinanceiras, tiposDefeito, profiles, pecasUtilizadas, produtosUtilizados,
  type User, type InsertUser, type Cliente, type InsertCliente,
  type Produto, type InsertProduto, type OrdemServico, type InsertOrdemServico,
  type EntradaFinanceira, type InsertEntradaFinanceira,
  type CategoriaFinanceira, type InsertCategoriaFinanceira,
  type TipoDefeito, type InsertTipoDefeito,
  type Profile, type InsertProfile
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;

  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile>;

  // Clientes
  getClientes(userId: string): Promise<Cliente[]>;
  getCliente(id: string, userId: string): Promise<Cliente | undefined>;
  createCliente(cliente: InsertCliente, userId: string): Promise<Cliente>;
  updateCliente(id: string, userId: string, cliente: Partial<InsertCliente>): Promise<Cliente>;
  deleteCliente(id: string, userId: string): Promise<void>;

  // Produtos
  getProdutos(userId: string): Promise<Produto[]>;
  getProduto(id: string, userId: string): Promise<Produto | undefined>;
  createProduto(produto: InsertProduto): Promise<Produto>;
  updateProduto(id: string, userId: string, produto: Partial<InsertProduto>): Promise<Produto>;
  deleteProduto(id: string, userId: string): Promise<void>;

  // Ordens de Serviço
  getOrdensServico(userId: string): Promise<OrdemServico[]>;
  getOrdemServico(id: string, userId: string): Promise<OrdemServico | undefined>;
  getOrdemServicoByToken(token: string): Promise<OrdemServico | undefined>;
  createOrdemServico(ordem: InsertOrdemServico, userId: string): Promise<OrdemServico>;
  updateOrdemServico(id: string, userId: string, ordem: Partial<InsertOrdemServico>): Promise<OrdemServico>;
  deleteOrdemServico(id: string, userId: string): Promise<void>;

  // Entradas Financeiras
  getEntradasFinanceiras(userId: string): Promise<EntradaFinanceira[]>;
  getEntradaFinanceira(id: string, userId: string): Promise<EntradaFinanceira | undefined>;
  createEntradaFinanceira(entrada: InsertEntradaFinanceira): Promise<EntradaFinanceira>;
  updateEntradaFinanceira(id: string, userId: string, entrada: Partial<InsertEntradaFinanceira>): Promise<EntradaFinanceira>;
  deleteEntradaFinanceira(id: string, userId: string): Promise<void>;

  // Categorias Financeiras
  getCategoriasFinanceiras(userId: string): Promise<CategoriaFinanceira[]>;
  createCategoriaFinanceira(categoria: InsertCategoriaFinanceira): Promise<CategoriaFinanceira>;

  // Tipos de Defeito
  getTiposDefeito(userId: string): Promise<TipoDefeito[]>;
  createTipoDefeito(tipo: InsertTipoDefeito): Promise<TipoDefeito>;

  // Produtos Utilizados
  addProdutoUtilizado(ordemId: string, produtoId: string, quantidade: number, valorUnitario: number): Promise<any>;
  removeProdutoUtilizado(id: string): Promise<void>;

  // Peças Utilizadas  
  addPecaUtilizada(ordemId: string, nome: string, quantidade: number, valorUnitario: number): Promise<any>;
  removePecaUtilizada(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Profiles
  async getProfile(userId: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile> {
    const result = await db
      .update(profiles)
      .set({ ...profile, updated_at: new Date() })
      .where(eq(profiles.id, userId))
      .returning();
    return result[0];
  }

  // Clientes
  async getClientes(userId: string): Promise<Cliente[]> {
    return db.select().from(clientes).where(eq(clientes.user_id, userId)).orderBy(desc(clientes.created_at));
  }

  async getCliente(id: string, userId: string): Promise<Cliente | undefined> {
    const result = await db
      .select()
      .from(clientes)
      .where(and(eq(clientes.id, id), eq(clientes.user_id, userId)))
      .limit(1);
    return result[0];
  }

  async createCliente(cliente: InsertCliente, userId: string): Promise<Cliente> {
    const clienteComUserId = { ...cliente, user_id: userId };
    const result = await db.insert(clientes).values(clienteComUserId as any).returning();
    return result[0];
  }

  async updateCliente(id: string, userId: string, cliente: Partial<InsertCliente>): Promise<Cliente> {
    const result = await db
      .update(clientes)
      .set({ ...cliente, updated_at: new Date() })
      .where(and(eq(clientes.id, id), eq(clientes.user_id, userId)))
      .returning();
    return result[0];
  }

  async deleteCliente(id: string, userId: string): Promise<void> {
    await db.delete(clientes).where(and(eq(clientes.id, id), eq(clientes.user_id, userId)));
  }

  // Produtos
  async getProdutos(userId: string): Promise<Produto[]> {
    return db.select().from(produtos).where(and(eq(produtos.user_id, userId), eq(produtos.ativo, true))).orderBy(desc(produtos.created_at));
  }

  async getProduto(id: string, userId: string): Promise<Produto | undefined> {
    const result = await db
      .select()
      .from(produtos)
      .where(and(eq(produtos.id, id), eq(produtos.user_id, userId)))
      .limit(1);
    return result[0];
  }

  async createProduto(produto: InsertProduto): Promise<Produto> {
    const result = await db.insert(produtos).values(produto).returning();
    return result[0];
  }

  async updateProduto(id: string, userId: string, produto: Partial<InsertProduto>): Promise<Produto> {
    const result = await db
      .update(produtos)
      .set({ ...produto, updated_at: new Date() })
      .where(and(eq(produtos.id, id), eq(produtos.user_id, userId)))
      .returning();
    return result[0];
  }

  async deleteProduto(id: string, userId: string): Promise<void> {
    // Soft delete - marcar como inativo ao invés de deletar fisicamente
    await db.update(produtos)
      .set({ 
        ativo: false,
        updated_at: new Date()
      })
      .where(and(eq(produtos.id, id), eq(produtos.user_id, userId)));
  }

  // Ordens de Serviço
  async getOrdensServico(userId: string): Promise<OrdemServico[]> {
    // Buscar todas as ordens
    const ordens = await db.select().from(ordensServico)
      .where(eq(ordensServico.user_id, userId))
      .orderBy(desc(ordensServico.created_at));

    // Buscar dados da empresa
    const empresa = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    // Buscar todos os clientes para fazer o mapeamento
    const clientesMap = new Map();
    if (ordens.length > 0) {
      const clienteIds = Array.from(new Set(ordens.map(o => o.cliente_id)));
      const todosClientes = await db.select().from(clientes)
        .where(eq(clientes.user_id, userId));

      todosClientes.forEach(cliente => {
        clientesMap.set(cliente.id, cliente);
      });
    }

    // Para cada ordem, buscar produtos e peças utilizadas
    const ordensCompletas = await Promise.all(ordens.map(async (ordem) => {
      // Buscar produtos utilizados
      const produtosUtilizadosData = await db
        .select({
          id: produtosUtilizados.id,
          quantidade: produtosUtilizados.quantidade,
          valor_unitario: produtosUtilizados.valor_unitario,
          valor_total: produtosUtilizados.valor_total,
          produto: {
            id: produtos.id,
            nome: produtos.nome,
            categoria: produtos.categoria,
            descricao: produtos.descricao,
            preco_custo: produtos.preco_custo,
            preco_venda: produtos.preco_venda
          }
        })
        .from(produtosUtilizados)
        .leftJoin(produtos, eq(produtosUtilizados.produto_id, produtos.id))
        .where(eq(produtosUtilizados.ordem_servico_id, ordem.id));

      // Buscar peças utilizadas
      const pecasUtilizadasData = await db
        .select()
        .from(pecasUtilizadas)
        .where(eq(pecasUtilizadas.ordem_servico_id, ordem.id));

      // Calcular valor total dos produtos utilizados
      const valorProdutos = produtosUtilizadosData.reduce((total, produto) => {
        const valorProduto = typeof produto.valor_total === 'string' ? parseFloat(produto.valor_total) : produto.valor_total;
        return total + (valorProduto || 0);
      }, 0);

      // Calcular valor total das peças utilizadas
      const valorPecas = pecasUtilizadasData.reduce((total, peca) => {
        const valorPeca = typeof peca.valor_total === 'string' ? parseFloat(peca.valor_total) : peca.valor_total;
        return total + (valorPeca || 0);
      }, 0);

      // Valor base da ordem
      const valorBase = parseFloat(ordem.valor_total?.toString() || '0');
      const valorMaoObra = parseFloat(ordem.valor_mao_obra?.toString() || '0');
      const valorOrcamento = parseFloat(ordem.valor_orcamento?.toString() || '0');
      const desconto = parseFloat(ordem.desconto?.toString() || '0');
      const acrescimo = parseFloat(ordem.acrescimo?.toString() || '0');

      // Calcular valor final total
      const valorFinal = valorBase + valorMaoObra + valorOrcamento + valorProdutos + valorPecas + acrescimo - desconto;

      return {
        ...ordem,
        clientes: clientesMap.get(ordem.cliente_id) || null,
        produtos_utilizados: produtosUtilizadosData,
        pecas_utilizadas: pecasUtilizadasData,
        empresa: empresa[0] || null,
        valor_final: valorFinal
      };
    }));

    return ordensCompletas as any;
  }

  async getOrdemServico(id: string, userId: string): Promise<OrdemServico | undefined> {
    const result = await db
      .select()
      .from(ordensServico)
      .where(and(eq(ordensServico.id, id), eq(ordensServico.user_id, userId)))
      .limit(1);

    if (result[0]) {
      // Buscar dados do cliente
      const cliente = await db
        .select()
        .from(clientes)
        .where(eq(clientes.id, result[0].cliente_id))
        .limit(1);

      // Buscar produtos utilizados com detalhes do produto
      const produtosUtilizadosData = await db
        .select({
          id: produtosUtilizados.id,
          quantidade: produtosUtilizados.quantidade,
          valor_unitario: produtosUtilizados.valor_unitario,
          valor_total: produtosUtilizados.valor_total,
          produto: {
            id: produtos.id,
            nome: produtos.nome,
            categoria: produtos.categoria,
            descricao: produtos.descricao,
            preco_custo: produtos.preco_custo,
            preco_venda: produtos.preco_venda
          }
        })
        .from(produtosUtilizados)
        .leftJoin(produtos, eq(produtosUtilizados.produto_id, produtos.id))
        .where(eq(produtosUtilizados.ordem_servico_id, result[0].id));

      // Buscar peças utilizadas
      const pecasUtilizadasData = await db
        .select()
        .from(pecasUtilizadas)
        .where(eq(pecasUtilizadas.ordem_servico_id, result[0].id));

      // Buscar dados da empresa (perfil do usuário)
      const empresa = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1);

      return { 
        ...result[0], 
        clientes: cliente[0],
        produtos_utilizados: produtosUtilizadosData,
        pecas_utilizadas: pecasUtilizadasData,
        empresa: empresa[0]
      } as any;
    }
    return undefined;
  }

  async getOrdemServicoByToken(token: string): Promise<OrdemServico | undefined> {
    const result = await db
      .select()
      .from(ordensServico)
      .where(eq(ordensServico.link_token, token))
      .limit(1);
    return result[0];
  }

  async createOrdemServico(ordem: InsertOrdemServico, userId: string): Promise<OrdemServico> {
    // Obter ano atual
    const currentYear = new Date().getFullYear();
    
    // Buscar todas as ordens do ano atual para este usuário
    const currentYearOrders = await db
      .select({ numero: ordensServico.numero })
      .from(ordensServico)
      .where(eq(ordensServico.user_id, userId));

    // Filtrar ordens do ano atual e extrair o número sequencial
    const currentYearNumbers = currentYearOrders
      .filter(order => order.numero?.startsWith(`${currentYear}-`))
      .map(order => {
        const parts = order.numero?.split('-');
        return parts && parts.length === 2 ? parseInt(parts[1]) : 0;
      })
      .filter(num => !isNaN(num));

    // Encontrar o maior número sequencial do ano atual
    let maxSequential = 0;
    if (currentYearNumbers.length > 0) {
      maxSequential = Math.max(...currentYearNumbers);
    }

    // Próximo número sequencial
    const nextSequential = maxSequential + 1;
    const nextNumber = `${currentYear}-${nextSequential}`;

    const ordemComDados = {
      ...ordem,
      user_id: userId,
      numero: nextNumber
    };

    const result = await db.insert(ordensServico).values(ordemComDados as any).returning();
    return result[0];
  }

  async updateOrdemServico(id: string, userId: string, ordem: Partial<InsertOrdemServico>): Promise<OrdemServico> {
    const result = await db
      .update(ordensServico)
      .set({ ...ordem, updated_at: new Date() } as any)
      .where(and(eq(ordensServico.id, id), eq(ordensServico.user_id, userId)))
      .returning();
    return result[0];
  }

  async deleteOrdemServico(id: string, userId: string): Promise<void> {
    // Verificar se há entradas financeiras vinculadas antes de deletar
    const entradasVinculadas = await db.select()
      .from(entradasFinanceiras)
      .where(and(
        eq(entradasFinanceiras.ordem_servico_id, id),
        eq(entradasFinanceiras.user_id, userId)
      ));

    if (entradasVinculadas.length > 0) {
      throw new Error(`Não é possível excluir OS com ${entradasVinculadas.length} entrada(s) financeira(s) vinculada(s)`);
    }

    await db.delete(ordensServico).where(and(eq(ordensServico.id, id), eq(ordensServico.user_id, userId)));
  }

  // Entradas Financeiras
  async getEntradasFinanceiras(userId: string): Promise<EntradaFinanceira[]> {
    return db.select().from(entradasFinanceiras).where(eq(entradasFinanceiras.user_id, userId)).orderBy(desc(entradasFinanceiras.created_at));
  }

  async getEntradaFinanceira(id: string, userId: string): Promise<EntradaFinanceira | undefined> {
    const result = await db
      .select()
      .from(entradasFinanceiras)
      .where(and(eq(entradasFinanceiras.id, id), eq(entradasFinanceiras.user_id, userId)))
      .limit(1);
    return result[0];
  }

  async createEntradaFinanceira(entrada: InsertEntradaFinanceira): Promise<EntradaFinanceira> {
    const result = await db.insert(entradasFinanceiras).values(entrada).returning();
    return result[0];
  }

  async updateEntradaFinanceira(id: string, userId: string, entrada: Partial<InsertEntradaFinanceira>): Promise<EntradaFinanceira> {
    const result = await db
      .update(entradasFinanceiras)
      .set({ ...entrada, updated_at: new Date() })
      .where(and(eq(entradasFinanceiras.id, id), eq(entradasFinanceiras.user_id, userId)))
      .returning();
    return result[0];
  }

  async deleteEntradaFinanceira(id: string, userId: string): Promise<void> {
    await db.delete(entradasFinanceiras).where(and(eq(entradasFinanceiras.id, id), eq(entradasFinanceiras.user_id, userId)));
  }

  // Categorias Financeiras
  async getCategoriasFinanceiras(userId: string): Promise<CategoriaFinanceira[]> {
    return db.select().from(categoriasFinanceiras).where(eq(categoriasFinanceiras.user_id, userId));
  }

  async createCategoriaFinanceira(categoria: InsertCategoriaFinanceira): Promise<CategoriaFinanceira> {
    const result = await db.insert(categoriasFinanceiras).values(categoria).returning();
    return result[0];
  }

  // Tipos de Defeito
  async getTiposDefeito(userId: string): Promise<TipoDefeito[]> {
    return db.select().from(tiposDefeito).where(eq(tiposDefeito.user_id, userId));
  }

  async createTipoDefeito(tipo: InsertTipoDefeito): Promise<TipoDefeito> {
    const result = await db.insert(tiposDefeito).values(tipo).returning();
    return result[0];
  }

  // Produtos Utilizados
  async addProdutoUtilizado(ordemId: string, produtoId: string, quantidade: number, valorUnitario: number): Promise<any> {
    const valorTotal = quantidade * valorUnitario;
    const result = await db.insert(produtosUtilizados).values({
      ordem_servico_id: ordemId,
      produto_id: produtoId,
      quantidade,
      valor_unitario: valorUnitario.toString(),
      valor_total: valorTotal.toString()
    }).returning();
    return result[0];
  }

  async removeProdutoUtilizado(id: string): Promise<void> {
    await db.delete(produtosUtilizados).where(eq(produtosUtilizados.id, id));
  }

  // Peças Utilizadas
  async addPecaUtilizada(ordemId: string, nome: string, quantidade: number, valorUnitario: number): Promise<any> {
    const valorTotal = quantidade * valorUnitario;
    const result = await db.insert(pecasUtilizadas).values({
      ordem_servico_id: ordemId,
      nome,
      quantidade,
      valor_unitario: valorUnitario.toString(),
      valor_total: valorTotal.toString()
    }).returning();
    return result[0];
  }

  async removePecaUtilizada(id: string): Promise<void> {
    await db.delete(pecasUtilizadas).where(eq(pecasUtilizadas.id, id));
  }
}

export const storage = new DatabaseStorage();