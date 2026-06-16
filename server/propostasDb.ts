import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { propostas, itensPropostas, type InsertProposta } from "../drizzle/schema";
import { nanoid } from "nanoid";

export async function listarPropostas(clienteId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (clienteId) {
    return db.select().from(propostas).where(eq(propostas.clienteId, clienteId)).orderBy(desc(propostas.createdAt));
  }
  return db.select().from(propostas).orderBy(desc(propostas.createdAt));
}

export async function buscarPropostaPorId(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(propostas).where(eq(propostas.id, id)).limit(1);
  if (!result[0]) return null;
  const itens = await db.select().from(itensPropostas).where(eq(itensPropostas.propostaId, id));
  return { ...result[0], itens };
}

export async function criarProposta(data: InsertProposta, itens?: Array<{ descricao: string; quantidade: string; valorUnitario: string; valorTotal: string; unidade?: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const all = await db.select().from(propostas);
  const num = `PROP-${new Date().getFullYear()}-${String(all.length + 1).padStart(3, "0")}`;
  const linkPublico = nanoid(24);
  const result = await db.insert(propostas).values({ ...data, numero: num, linkPublico }).returning();
  const proposta = result[0];
  if (itens && itens.length > 0) {
    await db.insert(itensPropostas).values(itens.map((item, i) => ({
      propostaId: proposta.id,
      descricao: item.descricao,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
      unidade: item.unidade,
      ordem: i,
    })));
  }
  return proposta;
}

export async function atualizarProposta(id: number, data: Partial<InsertProposta>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(propostas).set({ ...data, updatedAt: new Date() }).where(eq(propostas.id, id)).returning();
  return result[0];
}

export async function excluirProposta(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(itensPropostas).where(eq(itensPropostas.propostaId, id));
  await db.delete(propostas).where(eq(propostas.id, id));
}
