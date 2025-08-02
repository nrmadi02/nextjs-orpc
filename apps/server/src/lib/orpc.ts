import { os } from "@orpc/server";
import type { Context } from "./context.js";

const o = os.$context<Context>();

const publicProcedure = o;

export { publicProcedure };
