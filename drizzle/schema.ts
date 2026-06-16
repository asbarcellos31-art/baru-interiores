import {
  pgTable, serial, text, varchar, integer, decimal, boolean,
  timestamp, date, pgEnum,
} from "drizzle-orm/pg-core";

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["admin", "arquiteto", "financeiro", "comercial", "cliente"]);
export const leadStatusEnum = pgEnum("lead_status", [
  "novo", "contato_feito", "briefing_enviado", "reuniao_marcada",
  "proposta_enviada", "negociacao", "contrato_fechado", "perdido",
]);
export const leadOrigemEnum = pgEnum("lead_origem", [
  "instagram", "whatsapp", "indicacao", "site", "trafego_pago", "outro",
]);
export const projetoStatusEnum = pgEnum("projeto_status", [
  "briefing", "levantamento", "estudo_preliminar", "layout", "projeto_3d",
  "projeto_executivo", "detalhamento", "orcamentos", "compras", "obra", "entrega", "concluido", "pausado",
]);
export const tarefaStatusEnum = pgEnum("tarefa_status", [
  "a_fazer", "em_andamento", "em_revisao", "aguardando_cliente", "concluida",
]);
export const tarefaPrioridadeEnum = pgEnum("tarefa_prioridade", ["baixa", "media", "alta", "urgente"]);
export const propostaStatusEnum = pgEnum("proposta_status", [
  "rascunho", "enviada", "visualizada", "aceita", "recusada", "expirada",
]);
export const contratoStatusEnum = pgEnum("contrato_status", [
  "aguardando_assinatura", "assinado", "em_execucao", "concluido", "cancelado",
]);
export const lancamentoTipoEnum = pgEnum("lancamento_tipo", ["receita", "despesa"]);
export const lancamentoStatusEnum = pgEnum("lancamento_status", ["pendente", "pago", "atrasado", "cancelado"]);
export const fornecedorCategoriaEnum = pgEnum("fornecedor_categoria", [
  "marcenaria", "iluminacao", "pedra", "gesso", "obra", "decoracao",
  "moveis", "eletros", "revestimento", "metalurgia", "texteis", "outro",
]);
export const compraStatusEnum = pgEnum("compra_status", [
  "orcado", "aprovado", "comprado", "entregue", "instalado", "cancelado",
]);

// ─── USERS ────────────────────────────────────────────────────────────────────

export const users = pgTable("app_users", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  role: userRoleEnum("role").default("arquiteto").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("app_sessions", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  userId: integer("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const permissoes = pgTable("app_permissoes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modulo: varchar("modulo", { length: 64 }).notNull(),
  podeVer: boolean("pode_ver").default(false).notNull(),
  podeCriar: boolean("pode_criar").default(false).notNull(),
  podeEditar: boolean("pode_editar").default(false).notNull(),
  podeDeletar: boolean("pode_deletar").default(false).notNull(),
});

// ─── LEADS ────────────────────────────────────────────────────────────────────

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 30 }),
  origem: leadOrigemEnum("origem").default("instagram").notNull(),
  status: leadStatusEnum("status").default("novo").notNull(),
  tipoImovel: varchar("tipo_imovel", { length: 100 }),
  cidade: varchar("cidade", { length: 100 }),
  orcamentoEstimado: decimal("orcamento_estimado", { precision: 15, scale: 2 }),
  tags: text("tags"),
  observacoes: text("observacoes"),
  motivoPerda: text("motivo_perda"),
  score: integer("score").default(0),
  responsavelId: integer("responsavel_id"),
  proximoFollowUp: date("proximo_follow_up"),
  convertidoClienteId: integer("convertido_cliente_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── CLIENTES ────────────────────────────────────────────────────────────────

export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 30 }),
  cpfCnpj: varchar("cpf_cnpj", { length: 20 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  dataNascimento: date("data_nascimento"),
  instagram: varchar("instagram", { length: 100 }),
  observacoes: text("observacoes"),
  leadId: integer("lead_id"),
  portalAtivo: boolean("portal_ativo").default(false).notNull(),
  portalSenhaHash: text("portal_senha_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── BRIEFINGS ────────────────────────────────────────────────────────────────

export const briefings = pgTable("briefings", {
  id: serial("id").primaryKey(),
  clienteId: integer("cliente_id").notNull(),
  projetoId: integer("projeto_id"),
  tipoImovel: varchar("tipo_imovel", { length: 100 }),
  metragem: decimal("metragem", { precision: 8, scale: 2 }),
  ambientes: text("ambientes"),
  estilo: varchar("estilo", { length: 100 }),
  referencias: text("referencias"),
  orcamentoEstimado: decimal("orcamento_estimado", { precision: 15, scale: 2 }),
  prazoDesejado: date("prazo_desejado"),
  prioridades: text("prioridades"),
  restricoes: text("restricoes"),
  moradores: text("moradores"),
  animais: boolean("animais").default(false),
  criancas: boolean("criancas").default(false),
  observacoes: text("observacoes"),
  resumoIA: text("resumo_ia"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── PROJETOS ────────────────────────────────────────────────────────────────

export const projetos = pgTable("projetos", {
  id: serial("id").primaryKey(),
  codigo: varchar("codigo", { length: 20 }),
  nome: varchar("nome", { length: 255 }).notNull(),
  clienteId: integer("cliente_id").notNull(),
  responsavelId: integer("responsavel_id"),
  status: projetoStatusEnum("status").default("briefing").notNull(),
  tipoImovel: varchar("tipo_imovel", { length: 100 }),
  endereco: text("endereco"),
  metragem: decimal("metragem", { precision: 8, scale: 2 }),
  ambientes: text("ambientes"),
  descricao: text("descricao"),
  dataInicio: date("data_inicio"),
  dataPrevisao: date("data_previsao"),
  dataConclusao: date("data_conclusao"),
  valorContrato: decimal("valor_contrato", { precision: 15, scale: 2 }),
  briefingId: integer("briefing_id"),
  contratoId: integer("contrato_id"),
  observacoesInternas: text("observacoes_internas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── ETAPAS DO PROJETO ────────────────────────────────────────────────────────

export const etapasProjeto = pgTable("etapas_projeto", {
  id: serial("id").primaryKey(),
  projetoId: integer("projeto_id").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  ordem: integer("ordem").default(0).notNull(),
  status: varchar("status", { length: 50 }).default("pendente").notNull(),
  dataInicio: date("data_inicio"),
  dataPrevisao: date("data_previsao"),
  dataConclusao: date("data_conclusao"),
  aprovadoCliente: boolean("aprovado_cliente").default(false).notNull(),
  dataAprovacao: timestamp("data_aprovacao"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── TAREFAS ────────────────────────────────────────────────────────────────

export const tarefas = pgTable("tarefas", {
  id: serial("id").primaryKey(),
  projetoId: integer("projeto_id"),
  etapaId: integer("etapa_id"),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  responsavelId: integer("responsavel_id"),
  status: tarefaStatusEnum("status").default("a_fazer").notNull(),
  prioridade: tarefaPrioridadeEnum("prioridade").default("media").notNull(),
  dataVencimento: date("data_vencimento"),
  dataConclusao: timestamp("data_conclusao"),
  checklist: text("checklist"),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── PROPOSTAS ────────────────────────────────────────────────────────────────

export const propostas = pgTable("propostas", {
  id: serial("id").primaryKey(),
  numero: varchar("numero", { length: 30 }),
  clienteId: integer("cliente_id").notNull(),
  leadId: integer("lead_id"),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  tipoServico: varchar("tipo_servico", { length: 100 }),
  descricao: text("descricao"),
  escopo: text("escopo"),
  escopoExcluido: text("escopo_excluido"),
  numRevisoes: integer("num_revisoes").default(2),
  prazoEntrega: varchar("prazo_entrega", { length: 100 }),
  validadeProposta: date("validade_proposta"),
  valorTotal: decimal("valor_total", { precision: 15, scale: 2 }).notNull(),
  formaPagamento: text("forma_pagamento"),
  status: propostaStatusEnum("status").default("rascunho").notNull(),
  linkPublico: varchar("link_publico", { length: 128 }),
  dataEnvio: timestamp("data_envio"),
  dataVisualizacao: timestamp("data_visualizacao"),
  dataAceite: timestamp("data_aceite"),
  motivoRecusa: text("motivo_recusa"),
  observacoes: text("observacoes"),
  responsavelId: integer("responsavel_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const itensPropostas = pgTable("itens_propostas", {
  id: serial("id").primaryKey(),
  propostaId: integer("proposta_id").notNull(),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  unidade: varchar("unidade", { length: 30 }),
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).default("1"),
  valorUnitario: decimal("valor_unitario", { precision: 15, scale: 2 }).notNull(),
  valorTotal: decimal("valor_total", { precision: 15, scale: 2 }).notNull(),
  ordem: integer("ordem").default(0),
});

// ─── CONTRATOS ────────────────────────────────────────────────────────────────

export const contratos = pgTable("contratos", {
  id: serial("id").primaryKey(),
  numero: varchar("numero", { length: 30 }),
  projetoId: integer("projeto_id"),
  propostaId: integer("proposta_id"),
  clienteId: integer("cliente_id").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo"),
  valorTotal: decimal("valor_total", { precision: 15, scale: 2 }).notNull(),
  formaPagamento: text("forma_pagamento"),
  status: contratoStatusEnum("status").default("aguardando_assinatura").notNull(),
  dataAssinatura: date("data_assinatura"),
  dataInicio: date("data_inicio"),
  dataPrevisaoTermino: date("data_previsao_termino"),
  assinaturaClienteUrl: text("assinatura_cliente_url"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── FINANCEIRO ───────────────────────────────────────────────────────────────

export const lancamentos = pgTable("financeiro_lancamentos", {
  id: serial("id").primaryKey(),
  projetoId: integer("projeto_id"),
  clienteId: integer("cliente_id"),
  fornecedorId: integer("fornecedor_id"),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  tipo: lancamentoTipoEnum("tipo").notNull(),
  categoria: varchar("categoria", { length: 100 }),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  valorPago: decimal("valor_pago", { precision: 15, scale: 2 }),
  dataVencimento: date("data_vencimento").notNull(),
  dataPagamento: date("data_pagamento"),
  status: lancamentoStatusEnum("status").default("pendente").notNull(),
  formaPagamento: varchar("forma_pagamento", { length: 50 }),
  parcela: integer("parcela"),
  totalParcelas: integer("total_parcelas"),
  recorrente: boolean("recorrente").default(false),
  comprovante: text("comprovante"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── FORNECEDORES ────────────────────────────────────────────────────────────

export const fornecedores = pgTable("fornecedores", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  categoria: fornecedorCategoriaEnum("categoria").notNull(),
  contato: varchar("contato", { length: 255 }),
  telefone: varchar("telefone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  cnpj: varchar("cnpj", { length: 20 }),
  endereco: text("endereco"),
  prazoMedio: integer("prazo_medio"),
  avaliacao: integer("avaliacao").default(5),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── COMPRAS / ORÇAMENTOS ─────────────────────────────────────────────────────

export const compras = pgTable("compras", {
  id: serial("id").primaryKey(),
  projetoId: integer("projeto_id").notNull(),
  fornecedorId: integer("fornecedor_id"),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  categoria: varchar("categoria", { length: 100 }),
  ambiente: varchar("ambiente", { length: 100 }),
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).default("1"),
  unidade: varchar("unidade", { length: 30 }),
  valorUnitarioOrcado: decimal("valor_unitario_orcado", { precision: 15, scale: 2 }),
  valorTotalOrcado: decimal("valor_total_orcado", { precision: 15, scale: 2 }),
  valorPago: decimal("valor_pago", { precision: 15, scale: 2 }),
  status: compraStatusEnum("status").default("orcado").notNull(),
  dataPedido: date("data_pedido"),
  dataEntregaPrevista: date("data_entrega_prevista"),
  dataEntregaReal: date("data_entrega_real"),
  linkProduto: text("link_produto"),
  codigoSku: varchar("codigo_sku", { length: 100 }),
  fotoProduto: text("foto_produto"),
  notaFiscal: text("nota_fiscal"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── MEMORIAL DESCRITIVO ─────────────────────────────────────────────────────

export const memoriais = pgTable("memoriais", {
  id: serial("id").primaryKey(),
  projetoId: integer("projeto_id").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const itensMemorial = pgTable("itens_memorial", {
  id: serial("id").primaryKey(),
  memorialId: integer("memorial_id").notNull(),
  ambiente: varchar("ambiente", { length: 100 }).notNull(),
  categoria: varchar("categoria", { length: 100 }).notNull(),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  especificacao: text("especificacao"),
  fornecedorSugerido: varchar("fornecedor_sugerido", { length: 255 }),
  codigoSku: varchar("codigo_sku", { length: 100 }),
  precoEstimado: decimal("preco_estimado", { precision: 15, scale: 2 }),
  linkCompra: text("link_compra"),
  fotoReferencia: text("foto_referencia"),
  alternativaEconomica: text("alternativa_economica"),
  alternativaPremium: text("alternativa_premium"),
  ordem: integer("ordem").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── ARQUIVOS ────────────────────────────────────────────────────────────────

export const arquivos = pgTable("arquivos", {
  id: serial("id").primaryKey(),
  projetoId: integer("projeto_id"),
  clienteId: integer("cliente_id"),
  etapaId: integer("etapa_id"),
  nome: varchar("nome", { length: 255 }).notNull(),
  nomeOriginal: varchar("nome_original", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 50 }),
  tamanho: integer("tamanho"),
  url: text("url").notNull(),
  categoria: varchar("categoria", { length: 100 }),
  versao: integer("versao").default(1),
  aprovado: boolean("aprovado").default(false),
  visivelCliente: boolean("visivel_cliente").default(false),
  comentario: text("comentario"),
  uploadPorId: integer("upload_por_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── CRONOGRAMA ───────────────────────────────────────────────────────────────

export const cronograma = pgTable("cronograma", {
  id: serial("id").primaryKey(),
  projetoId: integer("projeto_id").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  responsavel: varchar("responsavel", { length: 255 }),
  dataInicio: date("data_inicio").notNull(),
  dataFim: date("data_fim").notNull(),
  dataInicioReal: date("data_inicio_real"),
  dataFimReal: date("data_fim_real"),
  dependeDe: integer("depende_de"),
  status: varchar("status", { length: 50 }).default("pendente").notNull(),
  cor: varchar("cor", { length: 20 }).default("#c9a96e"),
  ordem: integer("ordem").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── COMENTÁRIOS ─────────────────────────────────────────────────────────────

export const comentarios = pgTable("comentarios", {
  id: serial("id").primaryKey(),
  projetoId: integer("projeto_id").notNull(),
  etapaId: integer("etapa_id"),
  tarefaId: integer("tarefa_id"),
  autorId: integer("autor_id"),
  autorNome: varchar("autor_nome", { length: 255 }),
  texto: text("texto").notNull(),
  visivelCliente: boolean("visivel_cliente").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── NOTIFICAÇÕES ────────────────────────────────────────────────────────────

export const notificacoes = pgTable("notificacoes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  tipo: varchar("tipo", { length: 50 }).default("info"),
  lida: boolean("lida").default(false).notNull(),
  link: varchar("link", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── TEMPLATES ────────────────────────────────────────────────────────────────

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  conteudo: text("conteudo").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;
export type Projeto = typeof projetos.$inferSelect;
export type InsertProjeto = typeof projetos.$inferInsert;
export type Tarefa = typeof tarefas.$inferSelect;
export type InsertTarefa = typeof tarefas.$inferInsert;
export type Proposta = typeof propostas.$inferSelect;
export type InsertProposta = typeof propostas.$inferInsert;
export type Contrato = typeof contratos.$inferSelect;
export type InsertContrato = typeof contratos.$inferInsert;
export type Lancamento = typeof lancamentos.$inferSelect;
export type InsertLancamento = typeof lancamentos.$inferInsert;
export type Fornecedor = typeof fornecedores.$inferSelect;
export type InsertFornecedor = typeof fornecedores.$inferInsert;
export type Compra = typeof compras.$inferSelect;
export type InsertCompra = typeof compras.$inferInsert;
export type Arquivo = typeof arquivos.$inferSelect;
export type Memorial = typeof memoriais.$inferSelect;
export type ItemMemorial = typeof itensMemorial.$inferSelect;
export type Cronograma = typeof cronograma.$inferSelect;
export type EtapaProjeto = typeof etapasProjeto.$inferSelect;
