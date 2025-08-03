import z from "zod";
import { paginationMeta } from "../lib/pagination";

export const baseContract = <T>(data: T) =>
  z.object({
    message: z.string(),
    data: data,
  });

export const paginationContract = <T>(data: T) =>
  z.object({
    message: z.string(),
    data: data,
    meta: paginationMeta,
  });
