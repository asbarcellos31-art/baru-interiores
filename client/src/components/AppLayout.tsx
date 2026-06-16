import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAppAuth } from "@/contexts/AppAuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, FolderOpen, CheckSquare, FileText, FileSignature,
  DollarSign, Truck, ShoppingCart, BookOpen, Calendar, Settings, Menu, X,
  ChevronDown, ChevronRight, LogOut, Sparkles, Building2,
} from "lucide-react";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  modulo?: string;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, modulo: "dashboard" },
  {
    label: "Clientes",
    icon: Users,
    children: [
      { href: "/leads", label: "Leads / CRM", icon: Users, modulo: "leads" },
      { href: "/clientes", label: "Clientes", icon: Users, modulo: "clientes" },
    ],
  },
  {
    label: "Projetos",
    icon: FolderOpen,
    children: [
      { href: "/projetos", label: "Projetos", icon: FolderOpen, modulo: "projetos" },
      { href: "/tarefas", label: "Tarefas", icon: CheckSquare, modulo: "tarefas" },
      { href: "/cronograma", label: "Cronograma", icon: Calendar, modulo: "cronograma" },
    ],
  },
  {
    label: "Comercial",
    icon: FileText,
    children: [
      { href: "/propostas", label: "Propostas", icon: FileText, modulo: "propostas" },
      { href: "/contratos", label: "Contratos", icon: FileSignature, modulo: "contratos" },
    ],
  },
  {
    label: "Operacional",
    icon: ShoppingCart,
    children: [
      { href: "/memorial", label: "Memorial Descritivo", icon: BookOpen, modulo: "memorial" },
      { href: "/fornecedores", label: "Fornecedores", icon: Truck, modulo: "fornecedores" },
      { href: "/compras", label: "Compras", icon: ShoppingCart, modulo: "compras" },
    ],
  },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign, modulo: "financeiro" },
  { href: "/ia", label: "Inteligência Artificial", icon: Sparkles, modulo: "ia" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, modulo: "configuracoes" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const [expanded, setExpanded] = useState<string[]>(["Clientes", "Projetos", "Comercial", "Operacional"]);
  const { appUser, isAdmin, isLoggedIn, isLoading, podeVer, logout } = useAppAuth();

  useEffect(() => {
    const handle = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const toggleGroup = (label: string) => {
    setExpanded(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  const isActive = (href: string) => location === href;
  const canSee = (modulo?: string) => !modulo || !isLoggedIn || isLoading || isAdmin || podeVer(modulo);
  const handleNav = () => { if (isMobile) setSidebarOpen(false); };

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf7f3]">
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col transition-all duration-300 flex-shrink-0 z-30",
          isMobile
            ? cn("fixed inset-y-0 left-0 w-72", sidebarOpen ? "translate-x-0" : "-translate-x-full")
            : cn(sidebarOpen ? "w-64" : "w-16")
        )}
        style={{ background: "linear-gradient(180deg, #1c1410 0%, #2a1e14 60%, #3a2a1a 100%)" }}
      >
        {/* Logo */}
        <div className="border-b border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex flex-col">
                <span className="text-2xl font-light tracking-[0.3em] text-[#c9a96e]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                  BARU
                </span>
                <span className="text-[9px] tracking-[0.25em] text-white/40 uppercase mt-0.5">
                  Interiores
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 gap-1">
              <div className="w-8 h-8 rounded flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#c9a96e]" />
              </div>
              <button onClick={() => setSidebarOpen(true)} className="p-1 rounded hover:bg-white/10 transition-colors">
                <Menu className="w-4 h-4 text-white/40" />
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {NAV.map(item => {
            if (!item.children) {
              if (!canSee(item.modulo)) return null;
              return (
                <Link key={item.href} href={item.href!} onClick={handleNav}>
                  <div className={cn(
                    "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all cursor-pointer",
                    isActive(item.href!) ? "bg-[#c9a96e]/20 text-[#c9a96e]" : "text-white/60 hover:text-white hover:bg-white/8"
                  )}>
                    <item.icon className={cn("w-4 h-4 flex-shrink-0", !sidebarOpen && "mx-auto")} />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </div>
                </Link>
              );
            }

            const hasVisible = item.children.some(c => canSee(c.modulo));
            if (!hasVisible) return null;
            const isExp = expanded.includes(item.label);
            const isGroupActive = item.children.some(c => c.href && isActive(c.href));

            return (
              <div key={item.label}>
                <button
                  onClick={() => sidebarOpen ? toggleGroup(item.label) : setSidebarOpen(true)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg w-[calc(100%-16px)] transition-all",
                    isGroupActive ? "text-[#c9a96e]" : "text-white/60 hover:text-white hover:bg-white/8"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", !sidebarOpen && "mx-auto")} />
                  {sidebarOpen && (
                    <>
                      <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                      {isExp ? <ChevronDown className="w-3.5 h-3.5 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                    </>
                  )}
                </button>
                {sidebarOpen && isExp && item.children.map(child => {
                  if (!canSee(child.modulo)) return null;
                  return (
                    <Link key={child.href} href={child.href!} onClick={handleNav}>
                      <div className={cn(
                        "flex items-center gap-3 pl-11 pr-4 py-2 mx-2 rounded-lg transition-all cursor-pointer",
                        isActive(child.href!) ? "bg-[#c9a96e]/15 text-[#c9a96e]" : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      )}>
                        <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-sm">{child.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-[#c9a96e]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-[#c9a96e]">
                  {appUser?.nome?.slice(0, 2).toUpperCase() || "??"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 truncate">{appUser?.nome || "—"}</p>
                <p className="text-xs text-white/40 truncate">{appUser?.role}</p>
              </div>
              <button onClick={logout} className="p-1.5 rounded hover:bg-white/10 transition-colors">
                <LogOut className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>
          ) : (
            <button onClick={logout} className="flex justify-center w-full p-2 rounded hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4 text-white/40" />
            </button>
          )}
        </div>
      </aside>

      {/* Toggle mobile */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-20 p-2 rounded-lg shadow-lg"
          style={{ background: "#1c1410" }}
        >
          <Menu className="w-5 h-5 text-[#c9a96e]" />
        </button>
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
