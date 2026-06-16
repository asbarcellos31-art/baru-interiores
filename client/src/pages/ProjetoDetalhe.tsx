import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { STATUS_PROJETO } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, ChevronLeft, MapPin, Calendar, DollarSign, User, Layers } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function ProjetoDetalhe({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const utils = trpc.useUtils();
  const { data: projeto, isLoading } = trpc.projetos.buscar.useQuery({ id });
  const { data: etapas = [] } = trpc.projetos.listarEtapas.useQuery({ projetoId: id });
  const { data: tarefas = [] } = trpc.tarefas.listar.useQuery({ projetoId: id });
  const atualizarEtapa = trpc.projetos.atualizarEtapa.useMutation({ onSuccess: () => { utils.projetos.listarEtapas.invalidate(); toast.success("Etapa atualizada!"); } });
  const atualizarProjeto = trpc.projetos.atualizar.useMutation({ onSuccess: () => { utils.projetos.buscar.invalidate(); toast.success("Status atualizado!"); } });

  if (isLoading) return <div className="p-6"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!projeto) return <div className="p-6"><p className="text-muted-foreground">Projeto não encontrado</p></div>;

  const statusInfo = STATUS_PROJETO[projeto.status as keyof typeof STATUS_PROJETO] || { label: projeto.status, color: "bg-gray-100 text-gray-700" };
  const etapasConcluidas = etapas.filter(e => e.status === "concluida").length;
  const pct = etapas.length > 0 ? Math.round((etapasConcluidas / etapas.length) * 100) : 0;

  const toggleEtapa = (etapa: any) => {
    const newStatus = etapa.status === "concluida" ? "em_andamento" : "concluida";
    atualizarEtapa.mutate({ id: etapa.id, status: newStatus, ...(newStatus === "concluida" ? { dataConclusao: new Date().toISOString().split("T")[0] } : {}) });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projetos">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>{projeto.nome}</h1>
            <span className="text-sm text-muted-foreground">{projeto.codigo}</span>
            <Badge className={`text-xs ${statusInfo.color} border-0`}>{statusInfo.label}</Badge>
          </div>
          <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
            {projeto.tipoImovel && <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{projeto.tipoImovel}</span>}
            {projeto.endereco && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{projeto.endereco}</span>}
            {projeto.dataPrevisao && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Prazo: {formatDate(projeto.dataPrevisao)}</span>}
            {projeto.valorContrato && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />R$ {parseFloat(projeto.valorContrato).toLocaleString("pt-BR")}</span>}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#1c1410]">Progresso do Projeto</span>
          <span className="text-sm font-semibold text-[#c9a96e]">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#c9a96e] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">{etapasConcluidas} de {etapas.length} etapas concluídas</p>
      </div>

      <Tabs defaultValue="etapas">
        <TabsList className="mb-4">
          <TabsTrigger value="etapas">Etapas</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas ({tarefas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="etapas">
          <div className="space-y-2">
            {etapas.map((etapa, i) => {
              const concluida = etapa.status === "concluida";
              const emAndamento = etapa.status === "em_andamento";
              return (
                <div key={etapa.id} className={cn("bg-white rounded-xl px-4 py-3 border shadow-sm flex items-center gap-3 transition-all", concluida ? "border-green-200 bg-green-50/50" : emAndamento ? "border-[#c9a96e]/30" : "border-gray-100")}>
                  <button onClick={() => toggleEtapa(etapa)} className="flex-shrink-0">
                    {concluida
                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                      : <Circle className="w-5 h-5 text-gray-300 hover:text-[#c9a96e] transition-colors" />}
                  </button>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", concluida && "line-through text-muted-foreground")}>{etapa.nome}</p>
                    {etapa.dataConclusao && <p className="text-xs text-muted-foreground">Concluída em {formatDate(etapa.dataConclusao)}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {emAndamento && <Badge className="text-xs bg-amber-100 text-amber-700 border-0">Em Andamento</Badge>}
                    {!concluida && !emAndamento && (
                      <button onClick={() => atualizarEtapa.mutate({ id: etapa.id, status: "em_andamento" })} className="text-xs text-[#c9a96e] hover:underline">
                        Iniciar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tarefas">
          <div className="space-y-2">
            {tarefas.map(tarefa => (
              <div key={tarefa.id} className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", tarefa.status === "concluida" ? "bg-green-500" : tarefa.status === "em_andamento" ? "bg-blue-500" : "bg-gray-300")} />
                  <p className={cn("text-sm font-medium", tarefa.status === "concluida" && "line-through text-muted-foreground")}>{tarefa.titulo}</p>
                  {tarefa.dataVencimento && <span className="text-xs text-muted-foreground ml-auto">{formatDate(tarefa.dataVencimento)}</span>}
                </div>
              </div>
            ))}
            {tarefas.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma tarefa</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
