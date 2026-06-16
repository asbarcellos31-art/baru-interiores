import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./_core/trpc";
import {
  listarUsuarios, buscarUsuarioPorId, criarUsuario, atualizarUsuario, deletarUsuario,
  loginUsuario, validarSessao, logoutSessao, listarPermissoesUsuario, salvarPermissoes,
} from "./configuracoesDb";
import { listarLeads, buscarLeadPorId, criarLead, atualizarLead, excluirLead, metricsLeads } from "./leadsDb";
import { listarClientes, buscarClientePorId, criarCliente, atualizarCliente, excluirCliente } from "./clientesDb";
import { listarProjetos, buscarProjetoPorId, criarProjeto, atualizarProjeto, excluirProjeto, listarEtapasProjeto, atualizarEtapa, metricasProjetos } from "./projetosDb";
import { listarTarefas, buscarTarefaPorId, criarTarefa, atualizarTarefa, excluirTarefa } from "./tarefasDb";
import { listarPropostas, buscarPropostaPorId, criarProposta, atualizarProposta, excluirProposta } from "./propostasDb";
import { listarLancamentos, criarLancamento, atualizarLancamento, excluirLancamento, metricasFinanceiro } from "./financeiroDb";
import { listarFornecedores, buscarFornecedorPorId, criarFornecedor, atualizarFornecedor, excluirFornecedor, listarCompras, criarCompra, atualizarCompra, excluirCompra } from "./fornecedoresDb";

const configuracoes = router({
  login: publicProcedure
    .input(z.object({ email: z.string().email(), senha: z.string() }))
    .mutation(async ({ input }) => {
      const result = await loginUsuario(input.email, input.senha);
      if (!result) throw new Error("Email ou senha incorretos");
      return result;
    }),
  validarToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      if (!input.token) return null;
      return validarSessao(input.token);
    }),
  logout: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      await logoutSessao(input.token);
      return { ok: true };
    }),
  listarUsuarios: protectedProcedure.query(() => listarUsuarios()),
  criarUsuario: adminProcedure
    .input(z.object({ nome: z.string(), email: z.string().email(), senha: z.string(), role: z.enum(["admin", "arquiteto", "financeiro", "comercial", "cliente"]) }))
    .mutation(async ({ input }) => criarUsuario(input)),
  atualizarUsuario: adminProcedure
    .input(z.object({ id: z.number(), nome: z.string().optional(), email: z.string().email().optional(), senha: z.string().optional(), role: z.string().optional(), ativo: z.boolean().optional() }))
    .mutation(async ({ input }) => { const { id, ...data } = input; return atualizarUsuario(id, data); }),
  deletarUsuario: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => deletarUsuario(input.id)),
  listarPermissoes: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => listarPermissoesUsuario(input.userId)),
  salvarPermissoes: adminProcedure
    .input(z.object({
      userId: z.number(),
      permissoes: z.array(z.object({ modulo: z.string(), podeVer: z.boolean(), podeCriar: z.boolean(), podeEditar: z.boolean(), podeDeletar: z.boolean() })),
    }))
    .mutation(async ({ input }) => salvarPermissoes(input.userId, input.permissoes)),
});

const leadsRouter = router({
  listar: protectedProcedure
    .input(z.object({ status: z.string().optional(), origem: z.string().optional(), busca: z.string().optional() }).optional())
    .query(async ({ input }) => listarLeads(input)),
  buscar: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => buscarLeadPorId(input.id)),
  criar: protectedProcedure
    .input(z.object({
      nome: z.string(), email: z.string().optional(), telefone: z.string().optional(),
      origem: z.string().optional(), status: z.string().optional(),
      tipoImovel: z.string().optional(), cidade: z.string().optional(),
      orcamentoEstimado: z.string().optional(), tags: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => criarLead(input as any)),
  atualizar: protectedProcedure
    .input(z.object({ id: z.number() }).merge(z.object({
      nome: z.string().optional(), email: z.string().optional(), telefone: z.string().optional(),
      origem: z.string().optional(), status: z.string().optional(),
      tipoImovel: z.string().optional(), cidade: z.string().optional(),
      orcamentoEstimado: z.string().optional(), tags: z.string().optional(),
      observacoes: z.string().optional(), motivoPerda: z.string().optional(),
      score: z.number().optional(), proximoFollowUp: z.string().optional(),
    })))
    .mutation(async ({ input }) => { const { id, ...data } = input; return atualizarLead(id, data as any); }),
  excluir: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => excluirLead(input.id)),
  metrics: protectedProcedure.query(() => metricsLeads()),
});

const clientesRouter = router({
  listar: protectedProcedure.input(z.object({ busca: z.string().optional() }).optional()).query(async ({ input }) => listarClientes(input?.busca)),
  buscar: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => buscarClientePorId(input.id)),
  criar: protectedProcedure
    .input(z.object({
      nome: z.string(), email: z.string().optional(), telefone: z.string().optional(),
      cpfCnpj: z.string().optional(), endereco: z.string().optional(),
      cidade: z.string().optional(), estado: z.string().optional(), cep: z.string().optional(),
      dataNascimento: z.string().optional(), instagram: z.string().optional(),
      observacoes: z.string().optional(), leadId: z.number().optional(),
    }))
    .mutation(async ({ input }) => criarCliente(input as any)),
  atualizar: protectedProcedure
    .input(z.object({ id: z.number() }).merge(z.object({
      nome: z.string().optional(), email: z.string().optional(), telefone: z.string().optional(),
      cpfCnpj: z.string().optional(), endereco: z.string().optional(),
      cidade: z.string().optional(), estado: z.string().optional(), cep: z.string().optional(),
      dataNascimento: z.string().optional(), instagram: z.string().optional(),
      observacoes: z.string().optional(),
    })))
    .mutation(async ({ input }) => { const { id, ...data } = input; return atualizarCliente(id, data as any); }),
  excluir: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => excluirCliente(input.id)),
});

const projetosRouter = router({
  listar: protectedProcedure
    .input(z.object({ clienteId: z.number().optional(), status: z.string().optional() }).optional())
    .query(async ({ input }) => listarProjetos(input)),
  buscar: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => buscarProjetoPorId(input.id)),
  criar: protectedProcedure
    .input(z.object({
      nome: z.string(), clienteId: z.number(), responsavelId: z.number().optional(),
      tipoImovel: z.string().optional(), endereco: z.string().optional(),
      metragem: z.string().optional(), ambientes: z.string().optional(),
      descricao: z.string().optional(), dataInicio: z.string().optional(),
      dataPrevisao: z.string().optional(), valorContrato: z.string().optional(),
    }))
    .mutation(async ({ input }) => criarProjeto(input as any)),
  atualizar: protectedProcedure
    .input(z.object({ id: z.number() }).merge(z.object({
      nome: z.string().optional(), status: z.string().optional(),
      responsavelId: z.number().optional(), tipoImovel: z.string().optional(),
      endereco: z.string().optional(), metragem: z.string().optional(),
      ambientes: z.string().optional(), descricao: z.string().optional(),
      dataInicio: z.string().optional(), dataPrevisao: z.string().optional(),
      dataConclusao: z.string().optional(), valorContrato: z.string().optional(),
      observacoesInternas: z.string().optional(),
    })))
    .mutation(async ({ input }) => { const { id, ...data } = input; return atualizarProjeto(id, data as any); }),
  excluir: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => excluirProjeto(input.id)),
  listarEtapas: protectedProcedure.input(z.object({ projetoId: z.number() })).query(async ({ input }) => listarEtapasProjeto(input.projetoId)),
  atualizarEtapa: protectedProcedure
    .input(z.object({ id: z.number(), status: z.string().optional(), aprovadoCliente: z.boolean().optional(), dataInicio: z.string().optional(), dataPrevisao: z.string().optional(), dataConclusao: z.string().optional(), observacoes: z.string().optional() }))
    .mutation(async ({ input }) => { const { id, ...data } = input; return atualizarEtapa(id, data as any); }),
  metrics: protectedProcedure.query(() => metricasProjetos()),
});

const tarefasRouter = router({
  listar: protectedProcedure
    .input(z.object({ projetoId: z.number().optional(), responsavelId: z.number().optional(), status: z.string().optional() }).optional())
    .query(async ({ input }) => listarTarefas(input)),
  buscar: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => buscarTarefaPorId(input.id)),
  criar: protectedProcedure
    .input(z.object({
      titulo: z.string(), projetoId: z.number().optional(), etapaId: z.number().optional(),
      descricao: z.string().optional(), responsavelId: z.number().optional(),
      status: z.string().optional(), prioridade: z.string().optional(),
      dataVencimento: z.string().optional(), checklist: z.string().optional(), tags: z.string().optional(),
    }))
    .mutation(async ({ input }) => criarTarefa(input as any)),
  atualizar: protectedProcedure
    .input(z.object({ id: z.number() }).merge(z.object({
      titulo: z.string().optional(), descricao: z.string().optional(),
      responsavelId: z.number().optional(), status: z.string().optional(),
      prioridade: z.string().optional(), dataVencimento: z.string().optional(),
      dataConclusao: z.string().optional(), checklist: z.string().optional(), tags: z.string().optional(),
    })))
    .mutation(async ({ input }) => { const { id, ...data } = input; return atualizarTarefa(id, data as any); }),
  excluir: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => excluirTarefa(input.id)),
});

const propostasRouter = router({
  listar: protectedProcedure.input(z.object({ clienteId: z.number().optional() }).optional()).query(async ({ input }) => listarPropostas(input?.clienteId)),
  buscar: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => buscarPropostaPorId(input.id)),
  criar: protectedProcedure
    .input(z.object({
      titulo: z.string(), clienteId: z.number(), leadId: z.number().optional(),
      tipoServico: z.string().optional(), descricao: z.string().optional(),
      escopo: z.string().optional(), escopoExcluido: z.string().optional(),
      numRevisoes: z.number().optional(), prazoEntrega: z.string().optional(),
      validadeProposta: z.string().optional(), valorTotal: z.string(),
      formaPagamento: z.string().optional(), observacoes: z.string().optional(),
      itens: z.array(z.object({ descricao: z.string(), quantidade: z.string(), valorUnitario: z.string(), valorTotal: z.string(), unidade: z.string().optional() })).optional(),
    }))
    .mutation(async ({ input }) => {
      const { itens, ...data } = input;
      return criarProposta(data as any, itens);
    }),
  atualizar: protectedProcedure
    .input(z.object({ id: z.number() }).merge(z.object({
      titulo: z.string().optional(), status: z.string().optional(),
      valorTotal: z.string().optional(), escopo: z.string().optional(),
      motivoRecusa: z.string().optional(), observacoes: z.string().optional(),
    })))
    .mutation(async ({ input }) => { const { id, ...data } = input; return atualizarProposta(id, data as any); }),
  excluir: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => excluirProposta(input.id)),
});

const financeiroRouter = router({
  listar: protectedProcedure
    .input(z.object({ projetoId: z.number().optional(), tipo: z.string().optional(), status: z.string().optional() }).optional())
    .query(async ({ input }) => listarLancamentos(input)),
  criar: protectedProcedure
    .input(z.object({
      descricao: z.string(), tipo: z.enum(["receita", "despesa"]),
      categoria: z.string().optional(), valor: z.string(),
      dataVencimento: z.string(), projetoId: z.number().optional(),
      clienteId: z.number().optional(), fornecedorId: z.number().optional(),
      formaPagamento: z.string().optional(), parcela: z.number().optional(),
      totalParcelas: z.number().optional(), observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => criarLancamento(input as any)),
  atualizar: protectedProcedure
    .input(z.object({ id: z.number() }).merge(z.object({
      descricao: z.string().optional(), status: z.string().optional(),
      valorPago: z.string().optional(), dataPagamento: z.string().optional(),
      observacoes: z.string().optional(),
    })))
    .mutation(async ({ input }) => { const { id, ...data } = input; return atualizarLancamento(id, data as any); }),
  excluir: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => excluirLancamento(input.id)),
  metrics: protectedProcedure.query(() => metricasFinanceiro()),
});

const fornecedoresRouter = router({
  listar: protectedProcedure.input(z.object({ categoria: z.string().optional() }).optional()).query(async ({ input }) => listarFornecedores(undefined, input?.categoria)),
  buscar: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => buscarFornecedorPorId(input.id)),
  criar: protectedProcedure
    .input(z.object({
      nome: z.string(), categoria: z.string(),
      contato: z.string().optional(), telefone: z.string().optional(), email: z.string().optional(),
      website: z.string().optional(), cnpj: z.string().optional(), endereco: z.string().optional(),
      prazoMedio: z.number().optional(), avaliacao: z.number().optional(), observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => criarFornecedor(input as any)),
  atualizar: protectedProcedure
    .input(z.object({ id: z.number() }).merge(z.object({
      nome: z.string().optional(), categoria: z.string().optional(),
      contato: z.string().optional(), telefone: z.string().optional(),
      email: z.string().optional(), avaliacao: z.number().optional(),
      observacoes: z.string().optional(), ativo: z.boolean().optional(),
    })))
    .mutation(async ({ input }) => { const { id, ...data } = input; return atualizarFornecedor(id, data as any); }),
  excluir: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => excluirFornecedor(input.id)),
  listarCompras: protectedProcedure.input(z.object({ projetoId: z.number().optional() }).optional()).query(async ({ input }) => listarCompras(input?.projetoId)),
  criarCompra: protectedProcedure
    .input(z.object({
      projetoId: z.number(), descricao: z.string(),
      fornecedorId: z.number().optional(), categoria: z.string().optional(),
      ambiente: z.string().optional(), quantidade: z.string().optional(),
      unidade: z.string().optional(), valorUnitarioOrcado: z.string().optional(),
      valorTotalOrcado: z.string().optional(), status: z.string().optional(),
      dataPedido: z.string().optional(), dataEntregaPrevista: z.string().optional(),
      linkProduto: z.string().optional(), codigoSku: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => criarCompra(input as any)),
  atualizarCompra: protectedProcedure
    .input(z.object({ id: z.number() }).merge(z.object({
      status: z.string().optional(), valorPago: z.string().optional(),
      dataEntregaReal: z.string().optional(), observacoes: z.string().optional(),
    })))
    .mutation(async ({ input }) => { const { id, ...data } = input; return atualizarCompra(id, data as any); }),
  excluirCompra: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => excluirCompra(input.id)),
});

export const appRouter = router({
  configuracoes,
  leads: leadsRouter,
  clientes: clientesRouter,
  projetos: projetosRouter,
  tarefas: tarefasRouter,
  propostas: propostasRouter,
  financeiro: financeiroRouter,
  fornecedores: fornecedoresRouter,
});

export type AppRouter = typeof appRouter;
