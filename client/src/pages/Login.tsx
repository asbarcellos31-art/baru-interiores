import { useState } from "react";
import { useLocation } from "wouter";
import { useAppAuth } from "@/contexts/AppAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isLoggedIn } = useAppAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) { setLocation("/dashboard"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, senha);
    setLoading(false);
    if (result.ok) {
      setLocation("/dashboard");
    } else {
      toast.error(result.error || "Erro ao fazer login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1c1410 0%, #2a1e14 50%, #3a2a1a 100%)" }}>
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-light tracking-[0.4em] text-[#c9a96e] mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            BARU
          </h1>
          <p className="text-sm tracking-[0.3em] text-white/40 uppercase">Interiores</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-light text-white mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Acesso ao Sistema
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs tracking-wider uppercase">E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a96e]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs tracking-wider uppercase">Senha</Label>
              <Input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#c9a96e]"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-11 font-medium tracking-wider"
              style={{ background: "#c9a96e", color: "white" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          BARU Interiores © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
