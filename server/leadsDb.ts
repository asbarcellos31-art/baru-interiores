import { eq, desc, and, ilike, or } from "drizzle-orm";
import { getDb } from "./db";
import { leads, type InsertLead } from "../drizzle/schema";

export async function listarLeads(filtros?: { status?: string; origem?: string; busca?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filtros?.status) conditions.push(eq(leads.status, filtros.status as any));
  if (filtros?.origem) conditions.push(eq(leads.origem, filtros.origem as any));
  if (filtros?.busca) {
    conditions.push(
      or(ilike(leads.nome, `%${filtros.busca}%`), ilike(leads.email ?? "", `%${filtros.busca}%`), ilike(leads.telefone ?? "", `%${filtros.busca}%`))
    );
  }
  return db.select().from(leads)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(leads.createdAt));
}

export async function buscarLeadPorId(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0] || null;
}

export async function criarLead(data: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(leads).values(data).returning();
  return result[0];
}

export async function atualizarLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(leads).set({ ...data, updatedAt: new Date() }).where(eq(leads.id, id)).returning();
  return result[0];
}

export async function excluirLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(leads).where(eq(leads.id, id));
}

export async function metricsLeads() {
  const db = await getDb();
  if (!db) return { total: 0, novo: 0, contato_feito: 0, proposta_enviada: 0, contrato_fechado: 0, perdido: 0 };
  const all = await db.select().from(leads);
  const count = (s: string) => all.filter(l => l.status === s).length;
  return {
    total: all.length,
    novo: count("novo"),
    contato_feito: count("contato_feito"),
    briefing_enviado: count("briefing_enviado"),
    reuniao_marcada: count("reuniao_marcada"),
    proposta_enviada: count("proposta_enviada"),
    negociacao: count("negociacao"),
    contrato_fechado: count("contrato_fechado"),
    perdido: count("perdido"),
  };
}
