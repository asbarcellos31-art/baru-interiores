import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { STATUS_PROJETO } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FolderOpen, Edit, Trash2, MoreHorizontal, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

export default function Projetos() {
  const [busca, setBusca] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editProjeto, setEditProjeto] = useState<any>(null);
  const [form, setForm] = useState({ nome: "", clienteId: "", tipoImovel: "", endereco: "", metragem: "", ambientes: "", descricao: "", dataInicio: "", dataPrevisao: "", valorContrato: "" });

  const utils = trpc.useUtils();
  const { data: projetos = [] } = trpc.projetos.listar.useQuery({});
  const { data: clientes = [] } = trpc.clientes.listar.useQuery({});
  const criar = trpc.projetos.criar.useMutation({ onSuccess: () => { utils.projetos.listar.invalidate(); toast.success("Projeto criado!"); setOpenForm(false); reset(); } });
  const atualizar = trpc.projetos.atualizar.useMutation({ onSuccess: () => { utils.projetos.listar.invalidate(); toast.success("Atualizado!"); setOpenForm(false); reset(); } });
  const excluir = trpc.projetos.excluir.useMutation({ onSuccess: () => { utils.projetos.listar.invalidate(); toast.success("Excluído"); } });

  const reset = () => { setEditProjeto(null); setForm({ nome: "", clienteId: "", tipoImovel: "", endereco: "", metragem: "", ambientes: "", descricao: "", dataInicio: "", dataPrevisao: "", valorContrato: "" }); };

  const openEdit = (p: any) => {
    setEditProjeto(p);
    setForm({ nome: p.nome, clienteId: String(p.clienteId), tipoImovel: p.tipoImovel || "", endereco: p.endereco || "", metragem: p.metragem || "", ambientes: p.ambientes || "", descricao: p.descricao || "", dataInicio: p.dataInicio || "", dataPrevisao: p.dataPrevisao || "", valorContrato: p.valorContrato || "" });
    setOpenForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.clienteId) return toast.error("Nome e cliente obrigatórios");
    const data = { ...form, clienteId: parseInt(form.clienteId) };
    if (editProjeto) atualizar.mutate({ id: editProjeto.id, ...data });
    else criar.mutate(data as any);
  };

  const statusInfo = (s: string) => STATUS_PROJETO[s as keyof typeof STATUS_PROJETO] || { label: s, color: "bg-gray-100 text-gray-700" };
  const filtered = projetos.filter(p => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()));
  const clienteNome = (id: number) => clientes.find(c => c.id === id)?.nome || "—";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>Projetos</h1>
          <p className="text-sm text-muted-foreground mt-1">{projetos.length} projeto{projetos.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { reset(); setOpenForm(true); }} className="bg-[#c9a96e] hover:bg-[#b8954f] text-white gap-2">
          <Plus className="w-4 h-4" /> Novo Projeto
        </Button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar projetos..." className="pl-9" />
      </div>

      <div className="space-y-3">
        {filtered.map(projeto => {
          const info = statusInfo(projeto.status);
          return (
            <div key={projeto.id} className="bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#c9a96e]/10 flex items-center justify-center flex-shrink-0">
                <FolderOpen className="w-5 h-5 text-[#c9a96e]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-[#1c1410]">{projeto.nome}</h3>
                  <span className="text-xs text-muted-foreground">{projeto.codigo}</span>
                  <Badge className={`text-xs ${info.color} border-0`}>{info.label}</Badge>
                </div>
                <div className="flex gap-4 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">Cliente: {clienteNome(projeto.clienteId)}</span>
                  {projeto.tipoImovel && <span className="text-xs text-muted-foreground">{projeto.tipoImovel}</span>}
                  {projeto.metragem && <span className="text-xs text-muted-foreground">{projeto.metragem}m²</span>}
                  {projeto.dataPrevisao && <span className="text-xs text-muted-foreground">Prazo: {formatDate(projeto.dataPrevisao)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {projeto.valorContrato && (
                  <span className="text-sm font-medium text-[#c9a96e] hidden sm:block">
                    R$ {parseFloat(projeto.valorContrato).toLocaleString("pt-BR")}
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild><Link href={`/projetos/${projeto.id}`}><Eye className="w-3.5 h-3.5 mr-2" /> Abrir Projeto</Link></DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEdit(projeto)}><Edit className="w-3.5 h-3.5 mr-2" /> Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500" onClick={() => excluir.mutate({ id: projeto.id })}><Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-light" style={{ fontFamily: "Cormorant Garamond, serif" }}>Nenhum projeto encontrado</p>
          </div>
        )}
      </div>

      <Dialog open={openForm} onOpenChange={o => { if (!o) { setOpenForm(false); reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editProjeto ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label>Nome do Projeto *</Label><Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Apartamento Família Silva" /></div>
              <div className="col-span-2 space-y-1">
                <Label>Cliente *</Label>
                <Select value={form.clienteId} onValueChange={v => setForm(f => ({ ...f, clienteId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
                  <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Tipo de Imóvel</Label><Input value={form.tipoImovel} onChange={e => setForm(f => ({ ...f, tipoImovel: e.target.value }))} placeholder="Apartamento" /></div>
              <div className="space-y-1"><Label>Metragem (m²)</Label><Input value={form.metragem} onChange={e => setForm(f => ({ ...f, metragem: e.target.value }))} placeholder="120" /></div>
              <div className="col-span-2 space-y-1"><Label>Endereço da Obra</Label><Input value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} /></div>
              <div className="col-span-2 space-y-1"><Label>Ambientes</Label><Input value={form.ambientes} onChange={e => setForm(f => ({ ...f, ambientes: e.target.value }))} placeholder="Sala, Cozinha, Suite..." /></div>
              <div className="space-y-1"><Label>Data de Início</Label><Input type="date" value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Prazo Previsto</Label><Input type="date" value={form.dataPrevisao} onChange={e => setForm(f => ({ ...f, dataPrevisao: e.target.value }))} /></div>
              <div className="col-span-2 space-y-1"><Label>Valor do Contrato (R$)</Label><Input value={form.valorContrato} onChange={e => setForm(f => ({ ...f, valorContrato: e.target.value }))} placeholder="0,00" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpenForm(false); reset(); }}>Cancelar</Button>
              <Button type="submit" className="bg-[#c9a96e] hover:bg-[#b8954f] text-white">{editProjeto ? "Salvar" : "Criar Projeto"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
