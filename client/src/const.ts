export const TOKEN_KEY = "baru_app_token";

export const STATUS_LEAD = {
  novo: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  contato_feito: { label: "Contato Feito", color: "bg-purple-100 text-purple-700" },
  briefing_enviado: { label: "Briefing Enviado", color: "bg-yellow-100 text-yellow-700" },
  reuniao_marcada: { label: "Reunião Marcada", color: "bg-orange-100 text-orange-700" },
  proposta_enviada: { label: "Proposta Enviada", color: "bg-cyan-100 text-cyan-700" },
  negociacao: { label: "Negociação", color: "bg-indigo-100 text-indigo-700" },
  contrato_fechado: { label: "Fechado", color: "bg-green-100 text-green-700" },
  perdido: { label: "Perdido", color: "bg-red-100 text-red-700" },
} as const;

export const STATUS_PROJETO = {
  briefing: { label: "Briefing", color: "bg-slate-100 text-slate-700" },
  levantamento: { label: "Levantamento", color: "bg-blue-100 text-blue-700" },
  estudo_preliminar: { label: "Estudo Preliminar", color: "bg-purple-100 text-purple-700" },
  layout: { label: "Layout", color: "bg-yellow-100 text-yellow-700" },
  projeto_3d: { label: "Projeto 3D", color: "bg-orange-100 text-orange-700" },
  projeto_executivo: { label: "Projeto Executivo", color: "bg-cyan-100 text-cyan-700" },
  detalhamento: { label: "Detalhamento", color: "bg-teal-100 text-teal-700" },
  orcamentos: { label: "Orçamentos", color: "bg-indigo-100 text-indigo-700" },
  compras: { label: "Compras", color: "bg-violet-100 text-violet-700" },
  obra: { label: "Obra", color: "bg-amber-100 text-amber-700" },
  entrega: { label: "Entrega", color: "bg-lime-100 text-lime-700" },
  concluido: { label: "Concluído", color: "bg-green-100 text-green-700" },
  pausado: { label: "Pausado", color: "bg-gray-100 text-gray-700" },
} as const;

export const STATUS_TAREFA = {
  a_fazer: { label: "A Fazer", color: "bg-slate-100 text-slate-700" },
  em_andamento: { label: "Em Andamento", color: "bg-blue-100 text-blue-700" },
  em_revisao: { label: "Em Revisão", color: "bg-yellow-100 text-yellow-700" },
  aguardando_cliente: { label: "Aguardando Cliente", color: "bg-orange-100 text-orange-700" },
  concluida: { label: "Concluída", color: "bg-green-100 text-green-700" },
} as const;

export const PRIORIDADE_TAREFA = {
  baixa: { label: "Baixa", color: "text-slate-500" },
  media: { label: "Média", color: "text-blue-500" },
  alta: { label: "Alta", color: "text-orange-500" },
  urgente: { label: "Urgente", color: "text-red-500" },
} as const;

export const ORIGENS_LEAD = [
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "indicacao", label: "Indicação" },
  { value: "site", label: "Site" },
  { value: "trafego_pago", label: "Tráfego Pago" },
  { value: "outro", label: "Outro" },
];

export const CATEGORIAS_FORNECEDOR = [
  { value: "marcenaria", label: "Marcenaria" },
  { value: "iluminacao", label: "Iluminação" },
  { value: "pedra", label: "Pedra / Granito" },
  { value: "gesso", label: "Gesso / Drywall" },
  { value: "obra", label: "Obra" },
  { value: "decoracao", label: "Decoração" },
  { value: "moveis", label: "Móveis" },
  { value: "eletros", label: "Eletrodomésticos" },
  { value: "revestimento", label: "Revestimento" },
  { value: "metalurgia", label: "Metalurgia" },
  { value: "texteis", label: "Têxteis" },
  { value: "outro", label: "Outro" },
];
