import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { TOKEN_KEY } from "@/const";

interface AppUser {
  id: number;
  nome: string;
  email: string;
  role: "admin" | "arquiteto" | "financeiro" | "comercial" | "cliente";
}

interface Permissao {
  modulo: string;
  label: string;
  podeVer: boolean;
  podeCriar: boolean;
  podeEditar: boolean;
  podeDeletar: boolean;
}

interface AppAuthContextType {
  appUser: AppUser | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  permissoes: Permissao[];
  podeVer: (modulo: string) => boolean;
  login: (email: string, senha: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AppAuthContext = createContext<AppAuthContextType | null>(null);

export function AppAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [permsCarregadas, setPermsCarregadas] = useState(false);
  const hasToken = !!token;

  const { data: userData, isLoading: loadingToken } = trpc.configuracoes.validarToken.useQuery(
    { token: token ?? "" },
    { enabled: hasToken, retry: false }
  );

  const { data: permsData } = trpc.configuracoes.listarPermissoes.useQuery(
    { userId: appUser?.id ?? 0 },
    { enabled: !!appUser?.id, refetchInterval: 30_000 }
  );

  useEffect(() => {
    if (!hasToken) { setAppUser(null); setPermsCarregadas(false); return; }
    if (loadingToken) return;
    if (userData) {
      setAppUser(userData as AppUser);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setAppUser(null);
      setPermsCarregadas(false);
    }
  }, [userData, loadingToken, hasToken]);

  useEffect(() => {
    if (permsData) { setPermissoes(permsData as Permissao[]); setPermsCarregadas(true); }
  }, [permsData]);

  useEffect(() => {
    if (!appUser) { setPermsCarregadas(false); setPermissoes([]); }
  }, [appUser?.id]);

  const loginMut = trpc.configuracoes.login.useMutation();

  const login = useCallback(async (email: string, senha: string) => {
    try {
      const result = await loginMut.mutateAsync({ email, senha });
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setPermsCarregadas(false);
      setAppUser(result.user as AppUser);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Erro ao fazer login" };
    }
  }, [loginMut]);

  const logoutMut = trpc.configuracoes.logout.useMutation();

  const logout = useCallback(() => {
    if (token) logoutMut.mutate({ token });
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAppUser(null);
    setPermissoes([]);
    setPermsCarregadas(false);
  }, [token, logoutMut]);

  const isAdmin = appUser?.role === "admin";
  const isLoggedIn = !!appUser;
  const isLoading = hasToken && (loadingToken || (!!appUser && !permsCarregadas));

  const podeVer = useCallback((modulo: string) => {
    if (!isLoggedIn) return false;
    if (isAdmin) return true;
    const perm = permissoes.find(p => p.modulo === modulo);
    return perm?.podeVer ?? false;
  }, [isLoggedIn, isAdmin, permissoes]);

  return (
    <AppAuthContext.Provider value={{ appUser, isAdmin, isLoggedIn, isLoading, permissoes, podeVer, login, logout }}>
      {children}
    </AppAuthContext.Provider>
  );
}

export function useAppAuth() {
  const ctx = useContext(AppAuthContext);
  if (!ctx) throw new Error("useAppAuth must be used inside AppAuthProvider");
  return ctx;
}
