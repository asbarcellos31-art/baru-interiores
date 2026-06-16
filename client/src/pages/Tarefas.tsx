import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { STATUS_TAREFA, PRIORIDADE_TAREFA } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle2, Circle, MoreHorizontal, Edit, Trash2, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const COLS = ["a_fazer", "em_andamento", "em_revisao", "aguardando_cliente", "concluida"] as const;

export default function Tarefas() {
  const [openForm, setOpenForm] = useState(false);
  const [editTarefa, setEditTarefa] = useState<any>(null);
  const [form, setForm] = useState({ titulo: "", projetoId: "", descricao: "", responsavelId: "", status: "a_fazer", prioridade: "media", dataVencimento: "", checklist: "" });

  const utils = trpc.useUtils();
  const { data: tarefas = [] } = trpc.tarefas.listar.useQuery({});
  const { data: projetos = [] } = trpc.projetos.listar.useQuery({});
  const { data: usuarios = [] } = trpc.configuracoes.listarUsuarios.useQuery();
  const criar = trpc.tarefas.criar.useMutation({ onSuccess: () => { utils.tarefas.listar.invalidate(); toast.success("Tarefa criada!"); setOpenForm(false); reset(); } });
  const atualizar = trpc.tarefas.atualizar.useMutation({ onSuccess: () => { utils.tarefas.listar.invalidate(); toast.success("Atualizada!"); setOpenForm(false); reset(); } });
  const excluir = trpc.tarefas.excluir.useMutation({ onSuccess: () => { utils.tarefas.listar.invalidate(); toast.success("Excluída"); } });

  const reset = () => { setEditTarefa(null); setForm({ titulo: "", projetoId: "", descricao: "", responsavelId: "", status: "a_fazer", prioridade: "media", dataVencimento: "", checklist: "" }); };
  const openEdit = (t: any) => {
    setEditTarefa(t);
    setForm({ titulo: t.titulo, projetoId: t.projetoId ? String(t.projetoId) : "", descricao: t.descricao || "", responsavelId: t.responsavelId ? String(t.responsavelId) : "", status: t.status, prioridade: t.prioridade, dataVencimento: t.dataVencimento || "", checklist: t.checklist || "" });
    setOpenForm(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return toast.error("Título obrigatório");
    const data = { ...form, projetoId: form.projetoId ? parseInt(form.projetoId) : undefined, responsavelId: form.responsavelId ? parseInt(form.responsavelId) : undefined };
    if (editTarefa) atualizar.mutate({ id: editTarefa.id, ...data });
    else criar.mutate(data as any);
  };

  const moverStatus = (tarefa: any, status: string) => {
    atualizar.mutate({ id: tarefa.id, status, ...(status === "concluida" ? { dataConclusao: new Date().toISOString() } : {}) });
  };

  const isAtrasada = (t: any) => t.dataVencimento && t.status !== "concluida" && new Date(t.dataVencimento) < new Date();
  const projetoNome = (id?: number) => id ? projetos.find(p => p.id === id)?.nome || "" : "";
  const statusInfo = (s: string) => STATUS_TAREFA[s as keyof typeof STATUS_TAREFA] || { label: s, color: "bg-gray-100 text-gray-700" };
  const prioInfo = (p: string) => PRIORIDADE_TAREFA[p as keyof typeof PRIORIDADE_TAREFA] || { label: p, color: "text-gray-500" };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>Tarefas</h1>
          <p className="text-sm text-muted-foreground mt-1">{tarefas.length} tarefa{tarefas.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { reset(); setOpenForm(true); }} className="bg-[#c9a96e] hover:bg-[#b8954f] text-white gap-2">
          <Plus className="w-4 h-4" /> Nova Tarefa
        </Button>
      </div>

      {/* Kanban */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4" style={{ minWidth: `${COLS.length * 240}px` }}>
          {COLS.map(col => {
            const items = tarefas.filter(t => t.status === col);
            const info = statusInfo(col);
            return (
              <div key={col} className="w-56 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${info.color}`}>{info.label}</span>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(tarefa => (
                    <div key={tarefa.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-medium text-sm text-[#1c1410] leading-snug flex-1">{tarefa.titulo}</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openEdit(tarefa)}><Edit className="w-3.5 h-3.5 mr-2" /> Editar</DropdownMenuItem>
                            {col !== "concluida" && <DropdownMenuItem onClick={() => moverStatus(tarefa, "concluida")}><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Concluir</DropdownMenuItem>}
                            <DropdownMenuItem className="text-red-500" onClick={() => excluir.mutate({ id: tarefa.id })}><Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {tarefa.projetoId && <p className="text-xs text-muted-foreground mt-1 truncate">{projetoNome(tarefa.projetoId)}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className={cn("text-xs font-medium", prioInfo(tarefa.prioridade).color)}>{prioInfo(tarefa.prioridade).label}</span>
                        {tarefa.dataVencimento && (
                          <span className={cn("text-xs", isAtrasada(tarefa) ? "text-red-500 font-medium" : "text-muted-foreground")}>
                            {isAtrasada(tarefa) && <AlertCircle className="w-3 h-3 inline mr-0.5" />}
                            {formatDate(tarefa.dataVencimento)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div className="text-center py-4 text-xs text-muted-foreground">Vazio</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={openForm} onOpenChange={o => { if (!o) { setOpenForm(false); reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarefa ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label>Título *</Label><Input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} /></div>
              <div className="col-span-2 space-y-1">
                <Label>Projeto</Label>
                <Select value={form.projetoId || "none"} onValueChange={v => setForm(f => ({ ...f, projetoId: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar projeto" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem projeto</SelectItem>
                    {projetos.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COLS.map(s => <SelectItem key={s} value={s}>{statusInfo(s).label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Prioridade</Label>
                <Select value={form.prioridade} onValueChange={v => setForm(f => ({ ...f, prioridade: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["baixa", "media", "alta", "urgente"].map(p => <SelectItem key={p} value={p}>{prioInfo(p).label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1"><Label>Descrição</Label><textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div className="space-y-1"><Label>Data de Vencimento</Label><Input type="date" value={form.dataVencimento} onChange={e => setForm(f => ({ ...f, dataVencimento: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpenForm(false); reset(); }}>Cancelar</Button>
              <Button type="submit" className="bg-[#c9a96e] hover:bg-[#b8954f] text-white">{editTarefa ? "Salvar" : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
