import { prisma } from "@repo/db";
import type { Context as HonoContext } from "hono";
import type { auth } from "./auth";

export async function createContext(
  context: HonoContext<{
    Variables: {
      user: typeof auth.$Infer.Session.user | null;
      session: typeof auth.$Infer.Session.session | null;
    };
  }>
) {
  return {
    req: context.req,
    db: prisma,
    session: context.get("session") || null,
    user: context.get("user") || null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
