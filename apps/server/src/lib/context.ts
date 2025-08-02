import { prisma } from "@repo/db";
import type { HonoRequest } from "hono";

export async function createContext(req: HonoRequest) {
	return {
		header: req.header,
		db: prisma,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
