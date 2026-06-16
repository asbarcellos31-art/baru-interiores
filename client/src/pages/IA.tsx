import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const PROMPTS_RAPIDOS = [
  { label: "Resumo de Briefing", template: "Com base neste briefing de cliente, crie um resumo executivo profissional:\n\n" },
  { label: "Proposta de Escopo", template: "Crie um escopo detalhado para um projeto de interiores com as seguintes características:\n\n" },
  { label: "Memorial Descritivo", template: "Crie um memorial descritivo para os seguintes ambientes:\n\n" },
  { label: "Mensagem para Cliente", template: "Crie uma mensagem profissional e calorosa para enviar ao cliente sobre:\n\n" },
  { label: "Relatório de Progresso", template: "Crie um relatório semanal de progresso do projeto com base nestas informações:\n\n" },
  { label: "Legenda Instagram", template: "Crie uma legenda para Instagram para um projeto de interiores concluído com as seguintes características:\n\n" },
];

export default function IA() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const enviar = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const apiKey = (window as any).__OPENAI_KEY__ || "";
      if (!apiKey) {
        // Simulação sem API key
        await new Promise(r => setTimeout(r, 1500));
        setOutput(`[IA] Para usar a IA integrada, configure a variável OPENAI_API_KEY no servidor.\n\nSua mensagem foi: "${input.slice(0, 100)}..."`);
      } else {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Você é um assistente especializado em arquitetura e design de interiores para o escritório BARU Interiores. Responda sempre em português, de forma profissional, elegante e objetiva." },
              { role: "user", content: input },
            ],
          }),
        });
        const data = await res.json();
        setOutput(data.choices?.[0]?.message?.content || "Sem resposta");
      }
    } catch (e: any) {
      toast.error("Erro ao consultar IA: " + e.message);
    }
    setLoading(false);
  };

  const copiar = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copiado!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#b8954f] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Assistente IA
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">Gere resumos, propostas, escopos e mensagens com inteligência artificial</p>
      </div>

      {/* Prompts rápidos */}
      <div className="flex gap-2 flex-wrap mb-5">
        {PROMPTS_RAPIDOS.map(p => (
          <button
            key={p.label}
            onClick={() => setInput(p.template)}
            className="text-xs px-3 py-1.5 rounded-full border border-[#c9a96e]/40 text-[#c9a96e] hover:bg-[#c9a96e]/10 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Descreva o que você precisa que a IA crie ou analise..."
          className="w-full px-5 py-4 text-sm resize-none outline-none min-h-[120px]"
          onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) enviar(); }}
        />
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-muted-foreground">Ctrl+Enter para enviar</span>
          <Button onClick={enviar} disabled={loading || !input.trim()} className="bg-[#c9a96e] hover:bg-[#b8954f] text-white gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "Gerando..." : "Enviar"}
          </Button>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="bg-white rounded-2xl border border-[#c9a96e]/20 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-[#c9a96e]/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c9a96e]" />
              <span className="text-sm font-medium text-[#1c1410]">Resposta da IA</span>
            </div>
            <button onClick={copiar} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#c9a96e] transition-colors">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <div className="px-5 py-4">
            <pre className="text-sm text-[#1c1410] whitespace-pre-wrap font-sans leading-relaxed">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
