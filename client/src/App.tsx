import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "./components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAppAuth } from "./contexts/AppAuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Clientes from "./pages/Clientes";
import Projetos from "./pages/Projetos";
import ProjetoDetalhe from "./pages/ProjetoDetalhe";
import Tarefas from "./pages/Tarefas";
import Propostas from "./pages/Propostas";
import Financeiro from "./pages/Financeiro";
import Fornecedores from "./pages/Fornecedores";
import IA from "./pages/IA";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAppAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "linear-gradient(135deg, #1c1410 0%, #2a1e14 100%)" }}>
        <div className="text-center">
          <div className="text-3xl font-light tracking-[0.4em] text-[#c9a96e]" style={{ fontFamily: "Cormorant Garamond, serif" }}>BARU</div>
          <div className="mt-3 flex gap-1 justify-center">
            {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        </div>
      </div>
    );
  }
  if (!isLoggedIn) return <Login />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/leads" component={Leads} />
      <Route path="/clientes" component={Clientes} />
      <Route path="/projetos" component={Projetos} />
      <Route path="/projetos/:id">{(params) => <ProjetoDetalhe params={params as any} />}</Route>
      <Route path="/tarefas" component={Tarefas} />
      <Route path="/propostas" component={Propostas} />
      <Route path="/financeiro" component={Financeiro} />
      <Route path="/fornecedores" component={Fornecedores} />
      <Route path="/ia" component={IA} />
      <Route path="/configuracoes" component={Configuracoes} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthGuard>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster position="top-right" />
      </AuthGuard>
    </ErrorBoundary>
  );
}
