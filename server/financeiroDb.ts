import { eq, desc, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import { lancamentos, type InsertLancamento } from "../drizzle/schema";

export async function listarLancamentos(filtros?: { projetoId?: number; tipo?: string; status?: string; mes?: number; ano?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filtros?.projetoId) conditions.push(eq(lancamentos.projetoId, filtros.projetoId));
  if (filtros?.tipo) conditions.push(eq(lancamentos.tipo, filtros.tipo as any));
  if (filtros?.status) conditions.push(eq(lancamentos.status, filtros.status as any));
  return db.select().from(lancamentos)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(lancamentos.dataVencimento));
}

export async function criarLancamento(data: InsertLancamento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lancamentos).values(data).returning();
  return result[0];
}

export async function atualizarLancamento(id: number, data: Partial<InsertLancamento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(lancamentos).set({ ...data, updatedAt: new Date() }).where(eq(lancamentos.id, id)).returning();
  return result[0];
}

export async function excluirLancamento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(lancamentos).where(eq(lancamentos.id, id));
}

export async function metricasFinanceiro() {
  const db = await getDb();
  if (!db) return { totalReceitas: 0, totalDespesas: 0, saldo: 0, pendente: 0 };
  const all = await db.select().from(lancamentos);
  let totalReceitas = 0, totalDespesas = 0, pendente = 0;
  for (const l of all) {
    const v = parseFloat(String(l.valor)) || 0;
    if (l.tipo === "receita") {
      if (l.status === "pago") totalReceitas += parseFloat(String(l.valorPago ?? v)) || v;
    } else {
      if (l.status === "pago") totalDespesas += parseFloat(String(l.valorPago ?? v)) || v;
      if (l.status === "pendente") pendente += v;
    }
  }
  return { totalReceitas, totalDespesas, saldo: totalReceitas - totalDespesas, pendente };
}
