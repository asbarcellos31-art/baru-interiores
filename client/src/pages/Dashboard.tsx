import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpen, DollarSign, CheckSquare, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";

function Stat({ label, value, icon: Icon, color, href }: { label: string; value: string | number; icon: any; color: string; href?: string }) {
  const content = (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all group cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-wider uppercase text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-light mt-1" style={{ fontFamily: "Cormorant Garamond, serif", color: "#1c1410" }}>
              {value}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function Dashboard() {
  const { data: metricsLeads } = trpc.leads.metrics.useQuery();
  const { data: metricsProjetos } = trpc.projetos.metrics.useQuery();
  const { data: metricsFinanceiro } = trpc.financeiro.metrics.useQuery();
  const { data: tarefas } = trpc.tarefas.listar.useQuery({ status: "em_andamento" });
  const { data: projetos } = trpc.projetos.listar.useQuery({});

  const projetosAtivos = projetos?.filter(p => !["concluido", "pausado"].includes(p.status)) ?? [];
  const tarefasPendentes = tarefas?.length ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do escritório BARU Interiores</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat
          label="Leads Ativos"
          value={metricsLeads?.total ?? 0}
          icon={Users}
          color="bg-amber-50 text-amber-600"
          href="/leads"
        />
        <Stat
          label="Projetos Ativos"
          value={metricsProjetos?.ativos ?? 0}
          icon={FolderOpen}
          color="bg-blue-50 text-blue-600"
          href="/projetos"
        />
        <Stat
          label="Receita Recebida"
          value={formatCurrency(metricsFinanceiro?.totalReceitas ?? 0)}
          icon={DollarSign}
          color="bg-green-50 text-green-600"
          href="/financeiro"
        />
        <Stat
          label="Tarefas em Andamento"
          value={tarefasPendentes}
          icon={CheckSquare}
          color="bg-purple-50 text-purple-600"
          href="/tarefas"
        />
      </div>

      {/* Funil de leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#c9a96e]" />
              Funil de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Novos", value: metricsLeads?.novo ?? 0, color: "bg-blue-400" },
                { label: "Briefing Enviado", value: metricsLeads?.briefing_enviado ?? 0, color: "bg-yellow-400" },
                { label: "Proposta Enviada", value: metricsLeads?.proposta_enviada ?? 0, color: "bg-orange-400" },
                { label: "Negociação", value: metricsLeads?.negociacao ?? 0, color: "bg-purple-400" },
                { label: "Contratos Fechados", value: metricsLeads?.contrato_fechado ?? 0, color: "bg-green-400" },
              ].map(item => {
                const total = metricsLeads?.total || 1;
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-36 flex-shrink-0">{item.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#c9a96e]" />
              Projetos em Execução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projetosAtivos.slice(0, 5).map(projeto => (
                <Link key={projeto.id} href={`/projetos/${projeto.id}`}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-[#c9a96e] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{projeto.nome}</p>
                      <p className="text-xs text-muted-foreground">{projeto.codigo}</p>
                    </div>
                  </div>
                </Link>
              ))}
              {projetosAtivos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum projeto ativo</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Receitas Recebidas", value: metricsFinanceiro?.totalReceitas ?? 0, color: "text-green-600" },
          { label: "Despesas Pagas", value: metricsFinanceiro?.totalDespesas ?? 0, color: "text-red-500" },
          { label: "Saldo Líquido", value: metricsFinanceiro?.saldo ?? 0, color: (metricsFinanceiro?.saldo ?? 0) >= 0 ? "text-green-600" : "text-red-500" },
        ].map(item => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1">{item.label}</p>
              <p className={`text-2xl font-light ${item.color}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
                {formatCurrency(item.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
