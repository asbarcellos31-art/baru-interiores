import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CATEGORIAS_FORNECEDOR } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Truck, Star, Phone, Mail, Globe, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Fornecedores() {
  const [openForm, setOpenForm] = useState(false);
  const [editForn, setEditForn] = useState<any>(null);
  const [catFiltro, setCatFiltro] = useState<string>("");
  const [form, setForm] = useState({ nome: "", categoria: "marcenaria", contato: "", telefone: "", email: "", website: "", cnpj: "", endereco: "", prazoMedio: "", avaliacao: "5", observacoes: "" });

  const utils = trpc.useUtils();
  const { data: fornecedores = [] } = trpc.fornecedores.listar.useQuery({ categoria: catFiltro || undefined });
  const criar = trpc.fornecedores.criar.useMutation({ onSuccess: () => { utils.fornecedores.listar.invalidate(); toast.success("Fornecedor criado!"); setOpenForm(false); reset(); } });
  const atualizar = trpc.fornecedores.atualizar.useMutation({ onSuccess: () => { utils.fornecedores.listar.invalidate(); toast.success("Atualizado!"); setOpenForm(false); reset(); } });
  const excluir = trpc.fornecedores.excluir.useMutation({ onSuccess: () => { utils.fornecedores.listar.invalidate(); toast.success("Excluído"); } });

  const reset = () => { setEditForn(null); setForm({ nome: "", categoria: "marcenaria", contato: "", telefone: "", email: "", website: "", cnpj: "", endereco: "", prazoMedio: "", avaliacao: "5", observacoes: "" }); };

  const openEdit = (f: any) => {
    setEditForn(f);
    setForm({ nome: f.nome, categoria: f.categoria, contato: f.contato || "", telefone: f.telefone || "", email: f.email || "", website: f.website || "", cnpj: f.cnpj || "", endereco: f.endereco || "", prazoMedio: f.prazoMedio ? String(f.prazoMedio) : "", avaliacao: String(f.avaliacao || 5), observacoes: f.observacoes || "" });
    setOpenForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error("Nome obrigatório");
    const data = { ...form, prazoMedio: form.prazoMedio ? parseInt(form.prazoMedio) : undefined, avaliacao: parseInt(form.avaliacao) };
    if (editForn) atualizar.mutate({ id: editForn.id, ...data });
    else criar.mutate(data as any);
  };

  const catLabel = (v: string) => CATEGORIAS_FORNECEDOR.find(c => c.value === v)?.label || v;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>Fornecedores</h1>
          <p className="text-sm text-muted-foreground mt-1">{fornecedores.length} fornecedor{fornecedores.length !== 1 ? "es" : ""}</p>
        </div>
        <Button onClick={() => { reset(); setOpenForm(true); }} className="bg-[#c9a96e] hover:bg-[#b8954f] text-white gap-2">
          <Plus className="w-4 h-4" /> Novo Fornecedor
        </Button>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <Button variant={catFiltro === "" ? "default" : "outline"} size="sm" onClick={() => setCatFiltro("")} className={catFiltro === "" ? "bg-[#c9a96e] text-white" : ""}>Todos</Button>
        {CATEGORIAS_FORNECEDOR.map(cat => (
          <Button key={cat.value} variant={catFiltro === cat.value ? "default" : "outline"} size="sm" onClick={() => setCatFiltro(cat.value)} className={catFiltro === cat.value ? "bg-[#c9a96e] text-white" : ""}>{cat.label}</Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fornecedores.map(forn => (
          <div key={forn.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-[#c9a96e]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1c1410]">{forn.nome}</h3>
                  <Badge className="text-xs bg-amber-50 text-amber-700 border-0 mt-0.5">{catLabel(forn.categoria)}</Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(forn)}><Edit className="w-3.5 h-3.5 mr-2" /> Editar</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500" onClick={() => excluir.mutate({ id: forn.id })}><Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-3 space-y-1">
              {forn.contato && <p className="text-sm text-muted-foreground">{forn.contato}</p>}
              {forn.telefone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{forn.telefone}</div>}
              {forn.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{forn.email}</div>}
              {forn.website && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Globe className="w-3 h-3" />{forn.website}</div>}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < (forn.avaliacao || 0) ? "fill-[#c9a96e] text-[#c9a96e]" : "text-gray-200"}`} />)}
              </div>
              {forn.prazoMedio && <span className="text-xs text-muted-foreground">Prazo: {forn.prazoMedio} dias</span>}
            </div>
          </div>
        ))}
        {fornecedores.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <p className="text-lg font-light" style={{ fontFamily: "Cormorant Garamond, serif" }}>Nenhum fornecedor cadastrado</p>
          </div>
        )}
      </div>

      <Dialog open={openForm} onOpenChange={o => { if (!o) { setOpenForm(false); reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editForn ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
              <div className="col-span-2 space-y-1">
                <Label>Categoria *</Label>
                <Select value={form.categoria} onValueChange={v => setForm(f => ({ ...f, categoria: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIAS_FORNECEDOR.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Contato</Label><Input value={form.contato} onChange={e => setForm(f => ({ ...f, contato: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} /></div>
              <div className="space-y-1"><Label>E-mail</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Website</Label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Prazo Médio (dias)</Label><Input type="number" value={form.prazoMedio} onChange={e => setForm(f => ({ ...f, prazoMedio: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Avaliação (1-5)</Label><Input type="number" min="1" max="5" value={form.avaliacao} onChange={e => setForm(f => ({ ...f, avaliacao: e.target.value }))} /></div>
              <div className="col-span-2 space-y-1"><Label>CNPJ</Label><Input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} /></div>
              <div className="col-span-2 space-y-1"><Label>Observações</Label><textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpenForm(false); reset(); }}>Cancelar</Button>
              <Button type="submit" className="bg-[#c9a96e] hover:bg-[#b8954f] text-white">{editForn ? "Salvar" : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
