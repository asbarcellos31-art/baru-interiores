import { eq, desc, and } from "drizzle-orm";
import { getDb } from "./db";
import { tarefas, type InsertTarefa } from "../drizzle/schema";

export async function listarTarefas(filtros?: { projetoId?: number; responsavelId?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filtros?.projetoId) conditions.push(eq(tarefas.projetoId, filtros.projetoId));
  if (filtros?.responsavelId) conditions.push(eq(tarefas.responsavelId, filtros.responsavelId));
  if (filtros?.status) conditions.push(eq(tarefas.status, filtros.status as any));
  return db.select().from(tarefas)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(tarefas.createdAt));
}

export async function buscarTarefaPorId(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tarefas).where(eq(tarefas.id, id)).limit(1);
  return result[0] || null;
}

export async function criarTarefa(data: InsertTarefa) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tarefas).values(data).returning();
  return result[0];
}

export async function atualizarTarefa(id: number, data: Partial<InsertTarefa>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(tarefas).set({ ...data, updatedAt: new Date() }).where(eq(tarefas.id, id)).returning();
  return result[0];
}

export async function excluirTarefa(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tarefas).where(eq(tarefas.id, id));
}
