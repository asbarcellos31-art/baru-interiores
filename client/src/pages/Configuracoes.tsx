import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAppAuth } from "@/contexts/AppAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Shield, UserCheck } from "lucide-react";

const MODULOS = [
  { id: "dashboard", label: "Dashboard" }, { id: "leads", label: "CRM / Leads" },
  { id: "clientes", label: "Clientes" }, { id: "projetos", label: "Projetos" },
  { id: "tarefas", label: "Tarefas" }, { id: "propostas", label: "Propostas" },
  { id: "contratos", label: "Contratos" }, { id: "financeiro", label: "Financeiro" },
  { id: "fornecedores", label: "Fornecedores" }, { id: "compras", label: "Compras" },
  { id: "memorial", label: "Memorial Descritivo" }, { id: "cronograma", label: "Cronograma" },
  { id: "arquivos", label: "Arquivos" }, { id: "ia", label: "IA" },
  { id: "configuracoes", label: "Configurações" },
];

const ROLES = [
  { value: "admin", label: "Administrador" }, { value: "arquiteto", label: "Arquiteto/Designer" },
  { value: "financeiro", label: "Financeiro" }, { value: "comercial", label: "Comercial" },
  { value: "cliente", label: "Cliente" },
];

export default function Configuracoes() {
  const { isAdmin } = useAppAuth();
  const [openForm, setOpenForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", role: "arquiteto" });

  const utils = trpc.useUtils();
  const { data: usuarios = [] } = trpc.configuracoes.listarUsuarios.useQuery();
  const { data: permissoes = [] } = trpc.configuracoes.listarPermissoes.useQuery({ userId: selectedUserId ?? 0 }, { enabled: !!selectedUserId });
  const [localPerms, setLocalPerms] = useState<Record<string, Record<string, boolean>>>({});

  const criar = trpc.configuracoes.criarUsuario.useMutation({ onSuccess: () => { utils.configuracoes.listarUsuarios.invalidate(); toast.success("Usuário criado!"); setOpenForm(false); reset(); } });
  const atualizar = trpc.configuracoes.atualizarUsuario.useMutation({ onSuccess: () => { utils.configuracoes.listarUsuarios.invalidate(); toast.success("Atualizado!"); setOpenForm(false); reset(); } });
  const deletar = trpc.configuracoes.deletarUsuario.useMutation({ onSuccess: () => { utils.configuracoes.listarUsuarios.invalidate(); toast.success("Excluído"); } });
  const salvarPerms = trpc.configuracoes.salvarPermissoes.useMutation({ onSuccess: () => toast.success("Permissões salvas!") });

  const reset = () => { setEditUser(null); setForm({ nome: "", email: "", senha: "", role: "arquiteto" }); };
  const openEdit = (u: any) => { setEditUser(u); setForm({ nome: u.nome, email: u.email, senha: "", role: u.role }); setOpenForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim()) return toast.error("Nome e email obrigatórios");
    if (!editUser && !form.senha) return toast.error("Senha obrigatória");
    if (editUser) atualizar.mutate({ id: editUser.id, ...form });
    else criar.mutate({ ...form, role: form.role as any });
  };

  const getPerm = (modulo: string, tipo: string) => {
    if (localPerms[modulo]) return localPerms[modulo][tipo] ?? false;
    const p = permissoes.find((p: any) => p.modulo === modulo);
    return (p as any)?.[tipo] ?? false;
  };

  const setPerm = (modulo: string, tipo: string, val: boolean) => {
    setLocalPerms(prev => ({ ...prev, [modulo]: { ...(prev[modulo] || {}), [tipo]: val } }));
  };

  const handleSalvarPerms = () => {
    if (!selectedUserId) return;
    const permsArr = MODULOS.map(mod => ({
      modulo: mod.id,
      podeVer: getPerm(mod.id, "podeVer"),
      podeCriar: getPerm(mod.id, "podeCriar"),
      podeEditar: getPerm(mod.id, "podeEditar"),
      podeDeletar: getPerm(mod.id, "podeDeletar"),
    }));
    salvarPerms.mutate({ userId: selectedUserId, permissoes: permsArr });
  };

  const roleLabel = (r: string) => ROLES.find(x => x.value === r)?.label || r;

  if (!isAdmin) return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-muted-foreground">Apenas administradores podem acessar esta página</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-light text-[#1c1410] mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>Configurações</h1>

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium">Usuários do Sistema</h2>
            <Button onClick={() => { reset(); setOpenForm(true); }} className="bg-[#c9a96e] hover:bg-[#b8954f] text-white gap-2">
              <Plus className="w-4 h-4" /> Novo Usuário
            </Button>
          </div>
          <div className="space-y-3">
            {usuarios.map((u: any) => (
              <div key={u.id} className="bg-white rounded-xl px-5 py-4 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-[#c9a96e]/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-[#c9a96e]">{u.nome.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#1c1410]">{u.nome}</p>
                    <Badge className="text-xs bg-amber-50 text-amber-700 border-0">{roleLabel(u.role)}</Badge>
                    {!u.ativo && <Badge className="text-xs bg-red-50 text-red-700 border-0">Inativo</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(u)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => deletar.mutate({ id: u.id })}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissoes" className="mt-4">
          <div className="mb-4">
            <Label>Selecionar Usuário</Label>
            <Select value={selectedUserId ? String(selectedUserId) : ""} onValueChange={v => { setSelectedUserId(parseInt(v)); setLocalPerms({}); }}>
              <SelectTrigger className="w-64 mt-1"><SelectValue placeholder="Selecionar usuário" /></SelectTrigger>
              <SelectContent>{usuarios.filter((u: any) => u.role !== "admin").map((u: any) => <SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {selectedUserId && (
            <>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Módulo</th>
                      {["Ver", "Criar", "Editar", "Deletar"].map(h => <th key={h} className="text-center px-3 py-3 text-xs uppercase tracking-wider text-muted-foreground">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULOS.map((mod, i) => (
                      <tr key={mod.id} className={i % 2 === 0 ? "" : "bg-gray-50/30"}>
                        <td className="px-4 py-2.5 text-sm font-medium">{mod.label}</td>
                        {["podeVer", "podeCriar", "podeEditar", "podeDeletar"].map(tipo => (
                          <td key={tipo} className="text-center px-3 py-2.5">
                            <Switch checked={getPerm(mod.id, tipo)} onCheckedChange={v => setPerm(mod.id, tipo, v)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button onClick={handleSalvarPerms} className="bg-[#c9a96e] hover:bg-[#b8954f] text-white">Salvar Permissões</Button>
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={openForm} onOpenChange={o => { if (!o) { setOpenForm(false); reset(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
            <div className="space-y-1"><Label>E-mail *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Senha {editUser ? "(deixe vazio para manter)" : "*"}</Label><Input type="password" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} /></div>
            <div className="space-y-1">
              <Label>Perfil</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpenForm(false); reset(); }}>Cancelar</Button>
              <Button type="submit" className="bg-[#c9a96e] hover:bg-[#b8954f] text-white">{editUser ? "Salvar" : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
