import { eq, desc, ilike } from "drizzle-orm";
import { getDb } from "./db";
import { fornecedores, compras, type InsertFornecedor } from "../drizzle/schema";

export async function listarFornecedores(busca?: string, categoria?: string) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(fornecedores).$dynamic();
  if (categoria) query = query.where(eq(fornecedores.categoria, categoria as any));
  return query.orderBy(fornecedores.nome);
}

export async function buscarFornecedorPorId(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(fornecedores).where(eq(fornecedores.id, id)).limit(1);
  return result[0] || null;
}

export async function criarFornecedor(data: InsertFornecedor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(fornecedores).values(data).returning();
  return result[0];
}

export async function atualizarFornecedor(id: number, data: Partial<InsertFornecedor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(fornecedores).set({ ...data, updatedAt: new Date() }).where(eq(fornecedores.id, id)).returning();
  return result[0];
}

export async function excluirFornecedor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(fornecedores).where(eq(fornecedores.id, id));
}

export async function listarCompras(projetoId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (projetoId) {
    return db.select().from(compras).where(eq(compras.projetoId, projetoId)).orderBy(desc(compras.createdAt));
  }
  return db.select().from(compras).orderBy(desc(compras.createdAt));
}

export async function criarCompra(data: typeof compras.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(compras).values(data).returning();
  return result[0];
}

export async function atualizarCompra(id: number, data: Partial<typeof compras.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(compras).set({ ...data, updatedAt: new Date() }).where(eq(compras.id, id)).returning();
  return result[0];
}

export async function excluirCompra(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(compras).where(eq(compras.id, id));
}
