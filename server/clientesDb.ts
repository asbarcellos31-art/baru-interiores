import { eq, desc, ilike, or } from "drizzle-orm";
import { getDb } from "./db";
import { clientes, type InsertCliente } from "../drizzle/schema";

export async function listarClientes(busca?: string) {
  const db = await getDb();
  if (!db) return [];
  if (busca) {
    return db.select().from(clientes)
      .where(or(ilike(clientes.nome, `%${busca}%`), ilike(clientes.email ?? "", `%${busca}%`), ilike(clientes.telefone ?? "", `%${busca}%`)))
      .orderBy(desc(clientes.createdAt));
  }
  return db.select().from(clientes).orderBy(desc(clientes.createdAt));
}

export async function buscarClientePorId(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
  return result[0] || null;
}

export async function criarCliente(data: InsertCliente) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clientes).values(data).returning();
  return result[0];
}

export async function atualizarCliente(id: number, data: Partial<InsertCliente>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(clientes).set({ ...data, updatedAt: new Date() }).where(eq(clientes.id, id)).returning();
  return result[0];
}

export async function excluirCliente(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clientes).where(eq(clientes.id, id));
}
