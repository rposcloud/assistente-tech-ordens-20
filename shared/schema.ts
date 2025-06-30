import { pgTable, text, uuid, integer, boolean, decimal, date, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const tipoDocumentoEnum = pgEnum("tipo_documento", ["cpf", "cnpj"]);
export const categoriaProdutoEnum = pgEnum("categoria_produto", ["peca", "servico"]);
export const tipoEquipamentoEnum = pgEnum("tipo_equipamento", ["smartphone", "notebook", "desktop", "tablet", "outros", "todos"]);
export const statusOrdemEnum = pgEnum("status_ordem", ["aguardando_diagnostico", "aguardando_aprovacao", "aguardando_pecas", "em_reparo", "pronto_entrega", "entregue"]);
export const formaPagamentoEnum = pgEnum("forma_pagamento", ["dinheiro", "cartao_credito", "cartao_debito", "pix", "transferencia", "parcelado"]);
export const statusPagamentoEnum = pgEnum("status_pagamento", ["pendente", "pago", "parcial", "cancelado"]);
export const tipoEntradaFinanceiraEnum = pgEnum("tipo_entrada_financeira", ["receita", "despesa"]);

// Tables
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  nome_completo: text("nome_completo").notNull(),
  empresa: text("empresa"),
  cnpj: text("cnpj"),
  inscricao_estadual: text("inscricao_estadual"),
  inscricao_municipal: text("inscricao_municipal"),
  endereco: text("endereco"),
  numero: text("numero"),
  complemento: text("complemento"),
  bairro: text("bairro"),
  cep: text("cep"),
  cidade: text("cidade"),
  estado: text("estado"),
  telefone: text("telefone"),
  email_empresa: text("email_empresa"),
  site: text("site"),
  logo_url: text("logo_url"),
  dados_bancarios: text("dados_bancarios"),
  observacoes_empresa: text("observacoes_empresa"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const clientes = pgTable("clientes", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  email: text("email"),
  telefone: text("telefone"),
  cpf_cnpj: text("cpf_cnpj").notNull(),
  tipo_documento: tipoDocumentoEnum("tipo_documento").default("cpf").notNull(),
  data_nascimento: date("data_nascimento"),
  cep: text("cep"),
  endereco: text("endereco"),
  numero: text("numero"),
  complemento: text("complemento"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  estado: text("estado"),
  observacoes: text("observacoes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const produtos = pgTable("produtos", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  codigo: text("codigo"),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  categoria: categoriaProdutoEnum("categoria").notNull(),
  preco_custo: decimal("preco_custo", { precision: 10, scale: 2 }).default("0").notNull(),
  preco_venda: decimal("preco_venda", { precision: 10, scale: 2 }).default("0").notNull(),
  estoque: integer("estoque").default(0),
  unidade: text("unidade").default("un").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  tipo_equipamento: tipoEquipamentoEnum("tipo_equipamento").default("todos"),
  tempo_estimado: integer("tempo_estimado").default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ordensServico = pgTable("ordens_servico", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  numero: text("numero").notNull(),
  cliente_id: uuid("cliente_id").notNull().references(() => clientes.id, { onDelete: "restrict" }),
  tipo_equipamento: tipoEquipamentoEnum("tipo_equipamento").notNull(),
  marca: text("marca").notNull(),
  modelo: text("modelo").notNull(),
  numero_serie: text("numero_serie"),
  senha_equipamento: text("senha_equipamento"),
  acessorios: text("acessorios"),
  condicoes_equipamento: text("condicoes_equipamento"),
  defeito_relatado: text("defeito_relatado").notNull(),
  diagnostico_tecnico: text("diagnostico_tecnico"),
  solucao_aplicada: text("solucao_aplicada"),
  tecnico_responsavel: text("tecnico_responsavel"),
  prioridade: text("prioridade").default("normal"),
  valor_mao_obra: decimal("valor_mao_obra", { precision: 10, scale: 2 }).default("0").notNull(),
  valor_orcamento: decimal("valor_orcamento", { precision: 10, scale: 2 }).default("0"),
  valor_total: decimal("valor_total", { precision: 10, scale: 2 }).default("0").notNull(),
  desconto: decimal("desconto", { precision: 10, scale: 2 }).default("0"),
  acrescimo: decimal("acrescimo", { precision: 10, scale: 2 }).default("0"),
  valor_final: decimal("valor_final", { precision: 10, scale: 2 }).default("0"),
  forma_pagamento: formaPagamentoEnum("forma_pagamento"),
  status_pagamento: statusPagamentoEnum("status_pagamento").default("pendente"),
  data_pagamento: timestamp("data_pagamento", { withTimezone: true }),
  data_vencimento: timestamp("data_vencimento", { withTimezone: true }),
  data_previsao_entrega: date("data_previsao_entrega"),
  observacoes_pagamento: text("observacoes_pagamento"),
  finalizada: boolean("finalizada").default(false).notNull(),
  lucro: decimal("lucro", { precision: 10, scale: 2 }).default("0"),
  margem_lucro: decimal("margem_lucro", { precision: 5, scale: 2 }).default("0"),
  link_token: text("link_token").unique(),
  link_expires_at: timestamp("link_expires_at", { withTimezone: true }),
  prazo_entrega: date("prazo_entrega"),
  garantia: integer("garantia").default(90).notNull(),
  status: statusOrdemEnum("status").default("aguardando_diagnostico").notNull(),
  aprovado_cliente: boolean("aprovado_cliente").default(false),
  data_aprovacao: timestamp("data_aprovacao", { withTimezone: true }),
  data_abertura: timestamp("data_abertura", { withTimezone: true }).defaultNow().notNull(),
  data_conclusao: timestamp("data_conclusao", { withTimezone: true }),
  observacoes_internas: text("observacoes_internas"),
  historico_status: jsonb("historico_status").default("[]"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const pecasUtilizadas = pgTable("pecas_utilizadas", {
  id: uuid("id").defaultRandom().primaryKey(),
  ordem_servico_id: uuid("ordem_servico_id").notNull().references(() => ordensServico.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  quantidade: integer("quantidade").default(1).notNull(),
  valor_unitario: decimal("valor_unitario", { precision: 10, scale: 2 }).default("0").notNull(),
  valor_total: decimal("valor_total", { precision: 10, scale: 2 }).default("0").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const produtosUtilizados = pgTable("produtos_utilizados", {
  id: uuid("id").defaultRandom().primaryKey(),
  ordem_servico_id: uuid("ordem_servico_id").notNull().references(() => ordensServico.id, { onDelete: "cascade" }),
  produto_id: uuid("produto_id").notNull().references(() => produtos.id, { onDelete: "restrict" }),
  quantidade: integer("quantidade").default(1).notNull(),
  valor_unitario: decimal("valor_unitario", { precision: 10, scale: 2 }).default("0").notNull(),
  valor_total: decimal("valor_total", { precision: 10, scale: 2 }).default("0").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const entradasFinanceiras = pgTable("entradas_financeiras", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tipo: tipoEntradaFinanceiraEnum("tipo").notNull(),
  descricao: text("descricao").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).default("0").notNull(),
  categoria: text("categoria").notNull(),
  forma_pagamento: formaPagamentoEnum("forma_pagamento").notNull(),
  data_vencimento: date("data_vencimento").notNull(),
  status: statusPagamentoEnum("status").default("pendente").notNull(),
  observacoes: text("observacoes"),
  parcelas: integer("parcelas").default(1),
  parcela_atual: integer("parcela_atual").default(1),
  valor_parcela: decimal("valor_parcela", { precision: 10, scale: 2 }).default("0"),
  centro_custo: text("centro_custo"),
  conta_bancaria: text("conta_bancaria"),
  numero_documento: text("numero_documento"),
  pessoa_responsavel: text("pessoa_responsavel"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categoriasFinanceiras = pgTable("categorias_financeiras", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  tipo: tipoEntradaFinanceiraEnum("tipo").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tiposDefeito = pgTable("tipos_defeito", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  tipo_equipamento: tipoEquipamentoEnum("tipo_equipamento").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.id],
  }),
  clientes: many(clientes),
  produtos: many(produtos),
  ordensServico: many(ordensServico),
  entradasFinanceiras: many(entradasFinanceiras),
  categoriasFinanceiras: many(categoriasFinanceiras),
  tiposDefeito: many(tiposDefeito),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
}));

export const clientesRelations = relations(clientes, ({ one, many }) => ({
  user: one(users, {
    fields: [clientes.user_id],
    references: [users.id],
  }),
  ordensServico: many(ordensServico),
}));

export const produtosRelations = relations(produtos, ({ one, many }) => ({
  user: one(users, {
    fields: [produtos.user_id],
    references: [users.id],
  }),
  produtosUtilizados: many(produtosUtilizados),
}));

export const ordensServicoRelations = relations(ordensServico, ({ one, many }) => ({
  user: one(users, {
    fields: [ordensServico.user_id],
    references: [users.id],
  }),
  cliente: one(clientes, {
    fields: [ordensServico.cliente_id],
    references: [clientes.id],
  }),
  pecasUtilizadas: many(pecasUtilizadas),
  produtosUtilizados: many(produtosUtilizados),
}));

export const pecasUtilizadasRelations = relations(pecasUtilizadas, ({ one }) => ({
  ordemServico: one(ordensServico, {
    fields: [pecasUtilizadas.ordem_servico_id],
    references: [ordensServico.id],
  }),
}));

export const produtosUtilizadosRelations = relations(produtosUtilizados, ({ one }) => ({
  ordemServico: one(ordensServico, {
    fields: [produtosUtilizados.ordem_servico_id],
    references: [ordensServico.id],
  }),
  produto: one(produtos, {
    fields: [produtosUtilizados.produto_id],
    references: [produtos.id],
  }),
}));

export const entradasFinanceirasRelations = relations(entradasFinanceiras, ({ one }) => ({
  user: one(users, {
    fields: [entradasFinanceiras.user_id],
    references: [users.id],
  }),
}));

export const categoriasFinanceirasRelations = relations(categoriasFinanceiras, ({ one }) => ({
  user: one(users, {
    fields: [categoriasFinanceiras.user_id],
    references: [users.id],
  }),
}));

export const tiposDefeitoRelations = relations(tiposDefeito, ({ one }) => ({
  user: one(users, {
    fields: [tiposDefeito.user_id],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  created_at: true,
  updated_at: true,
});

export const insertClienteSchema = createInsertSchema(clientes).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertProdutoSchema = createInsertSchema(produtos).omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  preco_custo: z.union([z.string(), z.number()]).transform(val => String(val)),
  preco_venda: z.union([z.string(), z.number()]).transform(val => String(val)),
});

export const insertOrdemServicoSchema = createInsertSchema(ordensServico).omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  valor_mao_obra: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  valor_orcamento: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  valor_total: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  desconto: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  acrescimo: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  valor_final: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  lucro: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  margem_lucro: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  data_abertura: z.union([z.date(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

export const insertEntradaFinanceiraSchema = createInsertSchema(entradasFinanceiras).omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  valor: z.union([z.string(), z.number()]).transform(val => String(val)),
  parcelas: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
  parcela_atual: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
  valor_parcela: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
});

export const insertCategoriaFinanceiraSchema = createInsertSchema(categoriasFinanceiras).omit({
  id: true,
  created_at: true,
});

export const insertTipoDefeitoSchema = createInsertSchema(tiposDefeito).omit({
  id: true,
  created_at: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = z.infer<typeof insertClienteSchema>;
export type Produto = typeof produtos.$inferSelect;
export type InsertProduto = z.infer<typeof insertProdutoSchema>;
export type OrdemServico = typeof ordensServico.$inferSelect;
export type InsertOrdemServico = z.infer<typeof insertOrdemServicoSchema>;
export type EntradaFinanceira = typeof entradasFinanceiras.$inferSelect;
export type InsertEntradaFinanceira = z.infer<typeof insertEntradaFinanceiraSchema>;
export type CategoriaFinanceira = typeof categoriasFinanceiras.$inferSelect;
export type InsertCategoriaFinanceira = z.infer<typeof insertCategoriaFinanceiraSchema>;
export type TipoDefeito = typeof tiposDefeito.$inferSelect;
export type InsertTipoDefeito = z.infer<typeof insertTipoDefeitoSchema>;