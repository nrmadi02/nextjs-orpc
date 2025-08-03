import type { AnyContractRouter } from "@orpc/contract";
import { implement, os } from "@orpc/server";
import type { Context } from "./context.js";
import type { IPaginationMeta } from "./pagination.js";

const createResponse = <T>(message: string, data: T) => ({
  message,
  data,
});

const paginationResponse = <T>(
  message: string,
  data: T[],
  meta: IPaginationMeta
) => ({
  message,
  data,
  meta,
});

const implementRouter = <T extends AnyContractRouter>(contract: T) =>
  implement(contract).$context<Context>();

const o = os.$context<Context>();

const publicProcedure = o;

export {
  publicProcedure,
  implementRouter,
  o,
  createResponse,
  paginationResponse,
};
