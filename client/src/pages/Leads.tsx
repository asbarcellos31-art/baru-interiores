import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { STATUS_LEAD, ORIGENS_LEAD } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Phone, Mail, Filter, MoreHorizontal, Edit, Trash2, ArrowRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const STATUS_ORDER = ["novo", "contato_feito", "briefing_enviado", "reuniao_marcada", "proposta_enviada", "negociacao", "contrato_fechado", "perdido"];

export default function Leads() {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string | undefined>();
  const [openForm, setOpenForm] = useState(false);
  const [editLead, setEditLead] = useState<any>(null);
  const [form, setForm] = useState({
    nome: "", email: "", telefone: "", origem: "instagram",
    status: "novo", tipoImovel: "", cidade: "", orcamentoEstimado: "", observacoes: "",
  });

  const utils = trpc.useUtils();
  const { data: leads = [], isLoading } = trpc.leads.listar.useQuery({ busca: busca || undefined, status: statusFiltro });
  const criar = trpc.leads.criar.useMutation({ onSuccess: () => { utils.leads.listar.invalidate(); utils.leads.metrics.invalidate(); toast.success("Lead criado!"); setOpenForm(false); resetForm(); } });
  const atualizar = trpc.leads.atualizar.useMutation({ onSuccess: () => { utils.leads.listar.invalidate(); toast.success("Lead atualizado!"); setOpenForm(false); resetForm(); } });
  const excluir = trpc.leads.excluir.useMutation({ onSuccess: () => { utils.leads.listar.invalidate(); utils.leads.metrics.invalidate(); toast.success("Lead excluído"); } });

  const resetForm = () => {
    setEditLead(null);
    setForm({ nome: "", email: "", telefone: "", origem: "instagram", status: "novo", tipoImovel: "", cidade: "", orcamentoEstimado: "", observacoes: "" });
  };

  const openEdit = (lead: any) => {
    setEditLead(lead);
    setForm({ nome: lead.nome, email: lead.email || "", telefone: lead.telefone || "", origem: lead.origem, status: lead.status, tipoImovel: lead.tipoImovel || "", cidade: lead.cidade || "", orcamentoEstimado: lead.orcamentoEstimado || "", observacoes: lead.observacoes || "" });
    setOpenForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error("Nome obrigatório");
    if (editLead) {
      atualizar.mutate({ id: editLead.id, ...form });
    } else {
      criar.mutate(form as any);
    }
  };

  const avancarStatus = (lead: any) => {
    const idx = STATUS_ORDER.indexOf(lead.status);
    if (idx < STATUS_ORDER.length - 2) {
      atualizar.mutate({ id: lead.id, status: STATUS_ORDER[idx + 1] });
    }
  };

  const statusInfo = (s: string) => STATUS_LEAD[s as keyof typeof STATUS_LEAD] || { label: s, color: "bg-gray-100 text-gray-600" };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>CRM / Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">{leads.length} lead{leads.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { resetForm(); setOpenForm(true); }} className="bg-[#c9a96e] hover:bg-[#b8954f] text-white gap-2">
          <Plus className="w-4 h-4" /> Novo Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar leads..." className="pl-9" />
        </div>
        <Select value={statusFiltro || "todos"} onValueChange={v => setStatusFiltro(v === "todos" ? undefined : v)}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {STATUS_ORDER.map(s => <SelectItem key={s} value={s}>{statusInfo(s).label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Board view */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4" style={{ minWidth: `${STATUS_ORDER.slice(0, 7).length * 240}px` }}>
          {STATUS_ORDER.slice(0, 7).map(status => {
            const col = leads.filter(l => l.status === status);
            const info = statusInfo(status);
            return (
              <div key={status} className="w-56 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${info.color}`}>{info.label}</span>
                  <span className="text-xs text-muted-foreground">{col.length}</span>
                </div>
                <div className="space-y-2">
                  {col.map(lead => (
                    <div key={lead.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-medium text-sm text-[#1c1410] leading-snug">{lead.nome}</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(lead)}><Edit className="w-3.5 h-3.5 mr-2" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => avancarStatus(lead)}><ArrowRight className="w-3.5 h-3.5 mr-2" /> Avançar Status</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => excluir.mutate({ id: lead.id })}><Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {lead.cidade && <p className="text-xs text-muted-foreground mt-1">{lead.cidade}</p>}
                      {lead.telefone && <div className="flex items-center gap-1 mt-1.5"><Phone className="w-3 h-3 text-muted-foreground" /><span className="text-xs text-muted-foreground">{lead.telefone}</span></div>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</span>
                        {lead.orcamentoEstimado && <span className="text-xs font-medium text-[#c9a96e]">R$ {parseFloat(lead.orcamentoEstimado).toLocaleString("pt-BR")}</span>}
                      </div>
                    </div>
                  ))}
                  {col.length === 0 && <div className="text-center py-4 text-xs text-muted-foreground">Vazio</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={openForm} onOpenChange={o => { if (!o) { setOpenForm(false); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editLead ? "Editar Lead" : "Novo Lead"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
              <div className="space-y-1"><Label>E-mail</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} /></div>
              <div className="space-y-1">
                <Label>Origem</Label>
                <Select value={form.origem} onValueChange={v => setForm(f => ({ ...f, origem: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORIGENS_LEAD.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_ORDER.map(s => <SelectItem key={s} value={s}>{statusInfo(s).label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Tipo de Imóvel</Label><Input value={form.tipoImovel} onChange={e => setForm(f => ({ ...f, tipoImovel: e.target.value }))} placeholder="Ex: Apartamento" /></div>
              <div className="space-y-1"><Label>Cidade</Label><Input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} /></div>
              <div className="col-span-2 space-y-1"><Label>Orçamento Estimado (R$)</Label><Input value={form.orcamentoEstimado} onChange={e => setForm(f => ({ ...f, orcamentoEstimado: e.target.value }))} placeholder="0,00" /></div>
              <div className="col-span-2 space-y-1"><Label>Observações</Label><textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpenForm(false); resetForm(); }}>Cancelar</Button>
              <Button type="submit" className="bg-[#c9a96e] hover:bg-[#b8954f] text-white">{editLead ? "Salvar" : "Criar Lead"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
