import { Pool } from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const getPool = () => {
  if (!process.env.DATABASE_URL) return null;
  return new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
};

let _pool: Pool | null = null;
const pool = () => {
  if (!_pool) _pool = getPool();
  return _pool;
};

export const MODULOS_SISTEMA = [
  { id: "dashboard", label: "Dashboard" },
  { id: "leads", label: "CRM / Leads" },
  { id: "clientes", label: "Clientes" },
  { id: "projetos", label: "Projetos" },
  { id: "tarefas", label: "Tarefas" },
  { id: "propostas", label: "Propostas" },
  { id: "contratos", label: "Contratos" },
  { id: "financeiro", label: "Financeiro" },
  { id: "fornecedores", label: "Fornecedores" },
  { id: "compras", label: "Compras" },
  { id: "memorial", label: "Memorial Descritivo" },
  { id: "cronograma", label: "Cronograma" },
  { id: "arquivos", label: "Arquivos" },
  { id: "ia", label: "Inteligência Artificial" },
  { id: "configuracoes", label: "Configurações" },
] as const;

export type ModuloId = (typeof MODULOS_SISTEMA)[number]["id"];

export async function listarUsuarios() {
  const p = pool();
  if (!p) return [];
  const { rows } = await p.query(
    "SELECT id, nome, email, role, ativo, created_at FROM app_users ORDER BY nome ASC"
  );
  return rows;
}

export async function buscarUsuarioPorEmail(email: string) {
  const p = pool();
  if (!p) return null;
  const { rows } = await p.query("SELECT * FROM app_users WHERE email = $1 LIMIT 1", [
    email.toLowerCase().trim(),
  ]);
  return rows[0] || null;
}

export async function buscarUsuarioPorId(id: number) {
  const p = pool();
  if (!p) return null;
  const { rows } = await p.query(
    "SELECT id, nome, email, role, ativo, created_at FROM app_users WHERE id = $1 LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

export async function criarUsuario(dados: {
  nome: string;
  email: string;
  senha: string;
  role: "admin" | "arquiteto" | "financeiro" | "comercial" | "cliente";
}) {
  const p = pool();
  if (!p) throw new Error("Database not available");
  const senhaHash = await bcrypt.hash(dados.senha, 12);
  const { rows } = await p.query(
    "INSERT INTO app_users (nome, email, senha_hash, role, ativo) VALUES ($1, $2, $3, $4, TRUE) RETURNING id",
    [dados.nome.trim(), dados.email.toLowerCase().trim(), senhaHash, dados.role]
  );
  const userId = rows[0].id;
  for (const modulo of MODULOS_SISTEMA) {
    await p.query(
      `INSERT INTO app_permissoes (user_id, modulo, pode_ver, pode_criar, pode_editar, pode_deletar)
       VALUES ($1, $2, FALSE, FALSE, FALSE, FALSE) ON CONFLICT (user_id, modulo) DO NOTHING`,
      [userId, modulo.id]
    );
  }
  return userId;
}

export async function atualizarUsuario(
  id: number,
  dados: { nome?: string; email?: string; senha?: string; role?: string; ativo?: boolean }
) {
  const p = pool();
  if (!p) throw new Error("Database not available");
  const sets: string[] = [];
  const vals: any[] = [];
  let i = 1;
  if (dados.nome !== undefined) { sets.push(`nome = $${i++}`); vals.push(dados.nome.trim()); }
  if (dados.email !== undefined) { sets.push(`email = $${i++}`); vals.push(dados.email.toLowerCase().trim()); }
  if (dados.senha && dados.senha.length > 0) {
    const hash = await bcrypt.hash(dados.senha, 12);
    sets.push(`senha_hash = $${i++}`); vals.push(hash);
  }
  if (dados.role !== undefined) { sets.push(`role = $${i++}`); vals.push(dados.role); }
  if (dados.ativo !== undefined) { sets.push(`ativo = $${i++}`); vals.push(dados.ativo); }
  if (sets.length === 0) return;
  vals.push(id);
  await p.query(`UPDATE app_users SET ${sets.join(", ")} WHERE id = $${i}`, vals);
}

export async function deletarUsuario(id: number) {
  const p = pool();
  if (!p) return;
  await p.query("DELETE FROM app_sessions WHERE user_id = $1", [id]);
  await p.query("DELETE FROM app_permissoes WHERE user_id = $1", [id]);
  await p.query("DELETE FROM app_users WHERE id = $1", [id]);
}

export async function loginUsuario(email: string, senha: string) {
  const user = await buscarUsuarioPorEmail(email);
  if (!user || !user.ativo) return null;
  const ok = await bcrypt.compare(senha, user.senha_hash);
  if (!ok) return null;
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const p = pool();
  if (!p) return null;
  await p.query(
    "INSERT INTO app_sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
    [token, user.id, expiresAt]
  );
  return { token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } };
}

export async function validarSessao(token: string) {
  const p = pool();
  if (!p) return null;
  const { rows } = await p.query(
    `SELECT u.id, u.nome, u.email, u.role FROM app_sessions s
     JOIN app_users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > NOW() AND u.ativo = TRUE LIMIT 1`,
    [token]
  );
  return rows[0] || null;
}

export async function logoutSessao(token: string) {
  const p = pool();
  if (!p) return;
  await p.query("DELETE FROM app_sessions WHERE token = $1", [token]);
}

export async function listarPermissoesUsuario(userId: number) {
  const p = pool();
  if (!p) return [];
  const { rows } = await p.query(
    "SELECT modulo, pode_ver, pode_criar, pode_editar, pode_deletar FROM app_permissoes WHERE user_id = $1",
    [userId]
  );
  return MODULOS_SISTEMA.map(mod => {
    const perm = rows.find((r: any) => r.modulo === mod.id);
    return {
      modulo: mod.id,
      label: mod.label,
      podeVer: perm?.pode_ver ?? false,
      podeCriar: perm?.pode_criar ?? false,
      podeEditar: perm?.pode_editar ?? false,
      podeDeletar: perm?.pode_deletar ?? false,
    };
  });
}

export async function salvarPermissoes(userId: number, permissoes: Array<{ modulo: string; podeVer: boolean; podeCriar: boolean; podeEditar: boolean; podeDeletar: boolean }>) {
  const p = pool();
  if (!p) return;
  for (const perm of permissoes) {
    await p.query(
      `INSERT INTO app_permissoes (user_id, modulo, pode_ver, pode_criar, pode_editar, pode_deletar)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, modulo) DO UPDATE SET
         pode_ver = EXCLUDED.pode_ver,
         pode_criar = EXCLUDED.pode_criar,
         pode_editar = EXCLUDED.pode_editar,
         pode_deletar = EXCLUDED.pode_deletar`,
      [userId, perm.modulo, perm.podeVer, perm.podeCriar, perm.podeEditar, perm.podeDeletar]
    );
  }
}

export async function garantirAdminPadrao() {
  const p = pool();
  if (!p) return;
  const { rows } = await p.query("SELECT id FROM app_users WHERE role = 'admin' LIMIT 1");
  if (rows.length === 0) {
    await criarUsuario({
      nome: "Admin BARU",
      email: "admin@baruinteriores.com.br",
      senha: "baru@2025",
      role: "admin",
    });
    console.log("[Boot] Admin padrão criado: admin@baruinteriores.com.br / baru@2025");
  }
}
