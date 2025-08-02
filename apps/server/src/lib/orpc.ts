import type { AnyContractRouter } from "@orpc/contract";
import { implement, os } from "@orpc/server";
import type { Context } from "./context.js";

const implementRouter = <T extends AnyContractRouter>(contract: T) =>
  implement(contract).$context<Context>();

const o = os.$context<Context>();

const publicProcedure = o;

export { publicProcedure, implementRouter, o };
