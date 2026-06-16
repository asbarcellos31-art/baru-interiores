import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Edit, Trash2, MoreHorizontal, Send, CheckCircle2, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-700",
  enviada: "bg-blue-100 text-blue-700",
  visualizada: "bg-purple-100 text-purple-700",
  aceita: "bg-green-100 text-green-700",
  recusada: "bg-red-100 text-red-700",
  expirada: "bg-orange-100 text-orange-700",
};
const STATUS_LABELS: Record<string, string> = { rascunho: "Rascunho", enviada: "Enviada", visualizada: "Visualizada", aceita: "Aceita", recusada: "Recusada", expirada: "Expirada" };

const TIPOS_SERVICO = ["Consultoria", "Projeto de Interiores", "Projeto Arquitetônico", "Projeto Executivo", "Acompanhamento de Obra", "Decoração", "Móveis Planejados"];

export default function Propostas() {
  const [openForm, setOpenForm] = useState(false);
  const [editProposta, setEditProposta] = useState<any>(null);
  const [form, setForm] = useState({ titulo: "", clienteId: "", tipoServico: "", descricao: "", escopo: "", escopoExcluido: "", numRevisoes: "2", prazoEntrega: "", validadeProposta: "", valorTotal: "", formaPagamento: "", observacoes: "" });

  const utils = trpc.useUtils();
  const { data: propostas = [] } = trpc.propostas.listar.useQuery({});
  const { data: clientes = [] } = trpc.clientes.listar.useQuery({});
  const criar = trpc.propostas.criar.useMutation({ onSuccess: () => { utils.propostas.listar.invalidate(); toast.success("Proposta criada!"); setOpenForm(false); reset(); } });
  const atualizar = trpc.propostas.atualizar.useMutation({ onSuccess: () => { utils.propostas.listar.invalidate(); toast.success("Atualizada!"); } });
  const excluir = trpc.propostas.excluir.useMutation({ onSuccess: () => { utils.propostas.listar.invalidate(); toast.success("Excluída"); } });

  const reset = () => { setEditProposta(null); setForm({ titulo: "", clienteId: "", tipoServico: "", descricao: "", escopo: "", escopoExcluido: "", numRevisoes: "2", prazoEntrega: "", validadeProposta: "", valorTotal: "", formaPagamento: "", observacoes: "" }); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.clienteId || !form.valorTotal) return toast.error("Título, cliente e valor são obrigatórios");
    const data = { ...form, clienteId: parseInt(form.clienteId), numRevisoes: parseInt(form.numRevisoes) || 2 };
    if (editProposta) atualizar.mutate({ id: editProposta.id, ...data });
    else criar.mutate(data as any);
  };

  const clienteNome = (id: number) => clientes.find(c => c.id === id)?.nome || "—";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>Propostas</h1>
          <p className="text-sm text-muted-foreground mt-1">{propostas.length} proposta{propostas.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { reset(); setOpenForm(true); }} className="bg-[#c9a96e] hover:bg-[#b8954f] text-white gap-2">
          <Plus className="w-4 h-4" /> Nova Proposta
        </Button>
      </div>

      <div className="space-y-3">
        {propostas.map(proposta => (
          <div key={proposta.id} className="bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-[#1c1410]">{proposta.titulo}</h3>
                <span className="text-xs text-muted-foreground">{proposta.numero}</span>
                <Badge className={`text-xs ${STATUS_COLORS[proposta.status] || "bg-gray-100 text-gray-700"} border-0`}>{STATUS_LABELS[proposta.status] || proposta.status}</Badge>
              </div>
              <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                <span>Cliente: {clienteNome(proposta.clienteId)}</span>
                {proposta.tipoServico && <span>{proposta.tipoServico}</span>}
                {proposta.validadeProposta && <span>Válida até: {formatDate(proposta.validadeProposta)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#c9a96e]">{formatCurrency(proposta.valorTotal)}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => atualizar.mutate({ id: proposta.id, status: "enviada" })}><Send className="w-3.5 h-3.5 mr-2" /> Marcar Enviada</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => atualizar.mutate({ id: proposta.id, status: "aceita" })}><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Marcar Aceita</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => atualizar.mutate({ id: proposta.id, status: "recusada" })}><XCircle className="w-3.5 h-3.5 mr-2" /> Marcar Recusada</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500" onClick={() => excluir.mutate({ id: proposta.id })}><Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        {propostas.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-light" style={{ fontFamily: "Cormorant Garamond, serif" }}>Nenhuma proposta criada</p>
          </div>
        )}
      </div>

      <Dialog open={openForm} onOpenChange={o => { if (!o) { setOpenForm(false); reset(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Proposta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label>Título da Proposta *</Label><Input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Projeto de Interiores - Sala e Quartos" /></div>
              <div className="col-span-2 space-y-1">
                <Label>Cliente *</Label>
                <Select value={form.clienteId} onValueChange={v => setForm(f => ({ ...f, clienteId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
                  <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Tipo de Serviço</Label>
                <Select value={form.tipoServico} onValueChange={v => setForm(f => ({ ...f, tipoServico: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                  <SelectContent>{TIPOS_SERVICO.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1"><Label>Escopo Incluso</Label><textarea value={form.escopo} onChange={e => setForm(f => ({ ...f, escopo: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring" placeholder="O que está incluso no serviço..." /></div>
              <div className="col-span-2 space-y-1"><Label>Escopo Excluído</Label><textarea value={form.escopoExcluido} onChange={e => setForm(f => ({ ...f, escopoExcluido: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-ring" placeholder="O que NÃO está incluso..." /></div>
              <div className="space-y-1"><Label>Nº de Revisões</Label><Input type="number" value={form.numRevisoes} onChange={e => setForm(f => ({ ...f, numRevisoes: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Prazo de Entrega</Label><Input value={form.prazoEntrega} onChange={e => setForm(f => ({ ...f, prazoEntrega: e.target.value }))} placeholder="Ex: 45 dias úteis" /></div>
              <div className="space-y-1"><Label>Válida até</Label><Input type="date" value={form.validadeProposta} onChange={e => setForm(f => ({ ...f, validadeProposta: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Valor Total (R$) *</Label><Input value={form.valorTotal} onChange={e => setForm(f => ({ ...f, valorTotal: e.target.value }))} placeholder="0,00" /></div>
              <div className="col-span-2 space-y-1"><Label>Forma de Pagamento</Label><Input value={form.formaPagamento} onChange={e => setForm(f => ({ ...f, formaPagamento: e.target.value }))} placeholder="Ex: 50% na assinatura, 50% na entrega" /></div>
              <div className="col-span-2 space-y-1"><Label>Observações</Label><textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpenForm(false); reset(); }}>Cancelar</Button>
              <Button type="submit" className="bg-[#c9a96e] hover:bg-[#b8954f] text-white">Criar Proposta</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
