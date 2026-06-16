import { eq, desc, and } from "drizzle-orm";
import { getDb } from "./db";
import { projetos, etapasProjeto, type InsertProjeto } from "../drizzle/schema";

export async function listarProjetos(filtros?: { clienteId?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filtros?.clienteId) conditions.push(eq(projetos.clienteId, filtros.clienteId));
  if (filtros?.status) conditions.push(eq(projetos.status, filtros.status as any));
  return db.select().from(projetos)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(projetos.createdAt));
}

export async function buscarProjetoPorId(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(projetos).where(eq(projetos.id, id)).limit(1);
  return result[0] || null;
}

export async function criarProjeto(data: InsertProjeto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Gerar código automático: BARU-AAAA-NNN
  const ano = new Date().getFullYear();
  const all = await db.select().from(projetos);
  const seq = String(all.length + 1).padStart(3, "0");
  const codigo = `BARU-${ano}-${seq}`;
  const result = await db.insert(projetos).values({ ...data, codigo }).returning();
  const projeto = result[0];
  // Criar etapas padrão
  const etapasPadrao = [
    "Briefing", "Levantamento", "Estudo Preliminar", "Layout",
    "Projeto 3D", "Projeto Executivo", "Detalhamento", "Compras", "Obra", "Entrega",
  ];
  for (let i = 0; i < etapasPadrao.length; i++) {
    await db.insert(etapasProjeto).values({
      projetoId: projeto.id,
      nome: etapasPadrao[i],
      ordem: i,
      status: "pendente",
    });
  }
  return projeto;
}

export async function atualizarProjeto(id: number, data: Partial<InsertProjeto>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(projetos).set({ ...data, updatedAt: new Date() }).where(eq(projetos.id, id)).returning();
  return result[0];
}

export async function excluirProjeto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(etapasProjeto).where(eq(etapasProjeto.projetoId, id));
  await db.delete(projetos).where(eq(projetos.id, id));
}

export async function listarEtapasProjeto(projetoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(etapasProjeto)
    .where(eq(etapasProjeto.projetoId, projetoId))
    .orderBy(etapasProjeto.ordem);
}

export async function atualizarEtapa(id: number, data: Partial<typeof etapasProjeto.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(etapasProjeto).set(data).where(eq(etapasProjeto.id, id)).returning();
  return result[0];
}

export async function metricasProjetos() {
  const db = await getDb();
  if (!db) return { total: 0, ativos: 0, concluidos: 0, pausados: 0 };
  const all = await db.select().from(projetos);
  const concluidos = ["concluido", "entrega"];
  const ativos = all.filter(p => !concluidos.includes(p.status) && p.status !== "pausado").length;
  return {
    total: all.length,
    ativos,
    concluidos: all.filter(p => concluidos.includes(p.status)).length,
    pausados: all.filter(p => p.status === "pausado").length,
  };
}
