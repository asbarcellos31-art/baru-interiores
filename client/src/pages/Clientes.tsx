import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Phone, Mail, MapPin, Edit, Trash2, MoreHorizontal, FolderOpen } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { initials, formatDate } from "@/lib/utils";
import { Link } from "wouter";

export default function Clientes() {
  const [busca, setBusca] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editCliente, setEditCliente] = useState<any>(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", cidade: "", estado: "", endereco: "", cpfCnpj: "", instagram: "", observacoes: "" });

  const utils = trpc.useUtils();
  const { data: clientes = [] } = trpc.clientes.listar.useQuery({ busca: busca || undefined });
  const criar = trpc.clientes.criar.useMutation({ onSuccess: () => { utils.clientes.listar.invalidate(); toast.success("Cliente criado!"); setOpenForm(false); reset(); } });
  const atualizar = trpc.clientes.atualizar.useMutation({ onSuccess: () => { utils.clientes.listar.invalidate(); toast.success("Atualizado!"); setOpenForm(false); reset(); } });
  const excluir = trpc.clientes.excluir.useMutation({ onSuccess: () => { utils.clientes.listar.invalidate(); toast.success("Excluído"); } });

  const reset = () => { setEditCliente(null); setForm({ nome: "", email: "", telefone: "", cidade: "", estado: "", endereco: "", cpfCnpj: "", instagram: "", observacoes: "" }); };

  const openEdit = (c: any) => {
    setEditCliente(c);
    setForm({ nome: c.nome, email: c.email || "", telefone: c.telefone || "", cidade: c.cidade || "", estado: c.estado || "", endereco: c.endereco || "", cpfCnpj: c.cpfCnpj || "", instagram: c.instagram || "", observacoes: c.observacoes || "" });
    setOpenForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error("Nome obrigatório");
    if (editCliente) atualizar.mutate({ id: editCliente.id, ...form });
    else criar.mutate(form as any);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { reset(); setOpenForm(true); }} className="bg-[#c9a96e] hover:bg-[#b8954f] text-white gap-2">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar clientes..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map(cliente => (
          <div key={cliente.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#c9a96e]/15 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-[#c9a96e]">{initials(cliente.nome)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-[#1c1410] truncate">{cliente.nome}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(cliente)}><Edit className="w-3.5 h-3.5 mr-2" /> Editar</DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href={`/projetos?clienteId=${cliente.id}`}><FolderOpen className="w-3.5 h-3.5 mr-2" /> Ver Projetos</Link></DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500" onClick={() => excluir.mutate({ id: cliente.id })}><Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-1 mt-2">
                  {cliente.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{cliente.email}</div>}
                  {cliente.telefone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{cliente.telefone}</div>}
                  {cliente.cidade && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{cliente.cidade}{cliente.estado ? `, ${cliente.estado}` : ""}</div>}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Desde {formatDate(cliente.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
        {clientes.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <p className="text-lg font-light" style={{ fontFamily: "Cormorant Garamond, serif" }}>Nenhum cliente cadastrado</p>
          </div>
        )}
      </div>

      <Dialog open={openForm} onOpenChange={o => { if (!o) { setOpenForm(false); reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editCliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
              <div className="space-y-1"><Label>E-mail</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Cidade</Label><Input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Estado</Label><Input value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} maxLength={2} placeholder="SP" /></div>
              <div className="col-span-2 space-y-1"><Label>Endereço</Label><Input value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} /></div>
              <div className="space-y-1"><Label>CPF/CNPJ</Label><Input value={form.cpfCnpj} onChange={e => setForm(f => ({ ...f, cpfCnpj: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Instagram</Label><Input value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="@perfil" /></div>
              <div className="col-span-2 space-y-1"><Label>Observações</Label><textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpenForm(false); reset(); }}>Cancelar</Button>
              <Button type="submit" className="bg-[#c9a96e] hover:bg-[#b8954f] text-white">{editCliente ? "Salvar" : "Criar Cliente"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
