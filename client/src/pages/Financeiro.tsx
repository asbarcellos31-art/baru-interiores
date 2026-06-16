import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, DollarSign, CheckCircle2, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = { pendente: "bg-yellow-100 text-yellow-700", pago: "bg-green-100 text-green-700", atrasado: "bg-red-100 text-red-700", cancelado: "bg-gray-100 text-gray-700" };
const STATUS_LABELS: Record<string, string> = { pendente: "Pendente", pago: "Pago", atrasado: "Atrasado", cancelado: "Cancelado" };

const CATEGORIAS = ["Honorários", "Compra de Materiais", "Mão de Obra", "Frete", "Comissão", "Impostos", "Marketing", "Outros"];

export default function Financeiro() {
  const [openForm, setOpenForm] = useState(false);
  const [tab, setTab] = useState("receita");
  const [form, setForm] = useState({ descricao: "", tipo: "receita", categoria: "", valor: "", dataVencimento: "", formaPagamento: "", observacoes: "" });

  const utils = trpc.useUtils();
  const { data: lancamentos = [] } = trpc.financeiro.listar.useQuery({});
  const { data: metrics } = trpc.financeiro.metrics.useQuery();
  const criar = trpc.financeiro.criar.useMutation({ onSuccess: () => { utils.financeiro.listar.invalidate(); utils.financeiro.metrics.invalidate(); toast.success("Lançamento criado!"); setOpenForm(false); reset(); } });
  const atualizar = trpc.financeiro.atualizar.useMutation({ onSuccess: () => { utils.financeiro.listar.invalidate(); utils.financeiro.metrics.invalidate(); toast.success("Atualizado!"); } });
  const excluir = trpc.financeiro.excluir.useMutation({ onSuccess: () => { utils.financeiro.listar.invalidate(); utils.financeiro.metrics.invalidate(); toast.success("Excluído"); } });

  const reset = () => setForm({ descricao: "", tipo: "receita", categoria: "", valor: "", dataVencimento: "", formaPagamento: "", observacoes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao.trim() || !form.valor || !form.dataVencimento) return toast.error("Campos obrigatórios faltando");
    criar.mutate({ ...form, tipo: form.tipo as "receita" | "despesa" });
  };

  const receitas = lancamentos.filter(l => l.tipo === "receita");
  const despesas = lancamentos.filter(l => l.tipo === "despesa");
  const isAtrasado = (l: any) => l.status === "pendente" && new Date(l.dataVencimento) < new Date();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>Financeiro</h1>
        </div>
        <Button onClick={() => { reset(); setOpenForm(true); }} className="bg-[#c9a96e] hover:bg-[#b8954f] text-white gap-2">
          <Plus className="w-4 h-4" /> Novo Lançamento
        </Button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Receitas", value: metrics?.totalReceitas ?? 0, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Despesas", value: metrics?.totalDespesas ?? 0, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50" },
          { label: "Saldo Líquido", value: metrics?.saldo ?? 0, icon: DollarSign, color: (metrics?.saldo ?? 0) >= 0 ? "text-green-600" : "text-red-500", bg: "bg-amber-50" },
          { label: "A Pagar", value: metrics?.pendente ?? 0, icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-50" },
        ].map(item => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-wider uppercase text-muted-foreground">{item.label}</p>
                  <p className={cn("text-xl font-light mt-1", item.color)} style={{ fontFamily: "Cormorant Garamond, serif" }}>{formatCurrency(item.value)}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <item.icon className={cn("w-4 h-4", item.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="receita">Receitas ({receitas.length})</TabsTrigger>
          <TabsTrigger value="despesa">Despesas ({despesas.length})</TabsTrigger>
        </TabsList>

        {(["receita", "despesa"] as const).map(tipo => (
          <TabsContent key={tipo} value={tipo}>
            <div className="space-y-2 mt-3">
              {(tipo === "receita" ? receitas : despesas).map(l => {
                const atrasado = isAtrasado(l);
                return (
                  <div key={l.id} className={cn("bg-white rounded-xl px-4 py-3 border shadow-sm flex items-center gap-4 group", atrasado ? "border-red-200 bg-red-50/30" : "border-gray-100")}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-[#1c1410]">{l.descricao}</p>
                        {l.categoria && <span className="text-xs text-muted-foreground">{l.categoria}</span>}
                        <Badge className={cn("text-xs border-0", STATUS_COLORS[atrasado ? "atrasado" : l.status])}>{atrasado ? "Atrasado" : STATUS_LABELS[l.status]}</Badge>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Venc.: {formatDate(l.dataVencimento)}</span>
                        {l.dataPagamento && <span>Pago: {formatDate(l.dataPagamento)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("font-semibold", tipo === "receita" ? "text-green-600" : "text-red-500")}>{formatCurrency(l.valor)}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {l.status !== "pago" && <DropdownMenuItem onClick={() => atualizar.mutate({ id: l.id, status: "pago", dataPagamento: new Date().toISOString().split("T")[0] })}><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Marcar Pago</DropdownMenuItem>}
                          <DropdownMenuItem className="text-red-500" onClick={() => excluir.mutate({ id: l.id })}><Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
              {(tipo === "receita" ? receitas : despesas).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum lançamento</p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={openForm} onOpenChange={o => { if (!o) { setOpenForm(false); reset(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Lançamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Descrição *</Label><Input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Categoria</Label>
                <Select value={form.categoria || "sem"} onValueChange={v => setForm(f => ({ ...f, categoria: v === "sem" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sem">Sem categoria</SelectItem>
                    {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Valor (R$) *</Label><Input value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0,00" /></div>
              <div className="space-y-1"><Label>Vencimento *</Label><Input type="date" value={form.dataVencimento} onChange={e => setForm(f => ({ ...f, dataVencimento: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Forma de Pagamento</Label><Input value={form.formaPagamento} onChange={e => setForm(f => ({ ...f, formaPagamento: e.target.value }))} placeholder="PIX, Boleto..." /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpenForm(false); reset(); }}>Cancelar</Button>
              <Button type="submit" className="bg-[#c9a96e] hover:bg-[#b8954f] text-white">Criar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
