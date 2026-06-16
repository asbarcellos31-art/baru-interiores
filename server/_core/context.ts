import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { validarSessao } from "../configuracoesDb";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function extrairToken(req: CreateExpressContextOptions["req"]): string | null {
  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  const xToken = req.headers["x-app-token"];
  if (typeof xToken === "string" && xToken.trim().length > 0) return xToken.trim();

  const body: any = (req as any).body;
  if (body) {
    if (typeof body.token === "string" && body.token.length > 0) return body.token;
    if (typeof body === "object") {
      for (const key of Object.keys(body)) {
        const item = body[key];
        if (item && typeof item === "object") {
          const inner = item.json ?? item;
          if (inner && typeof inner.token === "string" && inner.token.length > 0) return inner.token;
        }
      }
    }
  }
  return null;
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    const token = extrairToken(opts.req);
    if (token) {
      const sess = await validarSessao(token);
      if (sess) user = sess as unknown as User;
    }
  } catch {
    user = null;
  }
  return { req: opts.req, res: opts.res, user };
}
