import { ORPCError } from "@orpc/client";
import z from "zod";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "../const/pagination.const";

export const paginationMeta = z.object({
  total: z.number(),
  lastPage: z.number(),
  currentPage: z.number(),
  totalPerPage: z.number(),
  prevPage: z.number().nullable(),
  nextPage: z.number().nullable(),
});

export const paginationParamsSchema = z.object({
  page: z.number().default(DEFAULT_PAGE_NUMBER),
  limit: z.number().default(DEFAULT_PAGE_SIZE),
});

export type IPaginationParams = z.infer<typeof paginationParamsSchema>;
export type IPaginationMeta = z.infer<typeof paginationMeta>;

export interface IPaginationResponse<T> {
  data: T[];
  meta: IPaginationMeta;
}

export const paginate = (params: IPaginationParams) => {
  const { page, limit } = params;
  const size = Math.abs(limit) || DEFAULT_PAGE_SIZE;
  const currentPage = Math.abs(page) || DEFAULT_PAGE_NUMBER;

  return {
    skip: (currentPage - 1) * size,
    take: size,
  };
};

export const paginationOutput = <T>(
  data: T[],
  total: number,
  query: IPaginationParams
): IPaginationResponse<T> => {
  const { page, limit } = query;
  const size = Math.abs(limit) || DEFAULT_PAGE_SIZE;
  const currentPage = Math.abs(page) || DEFAULT_PAGE_NUMBER;
  const lastPage = Math.ceil(total / size);
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < lastPage ? currentPage + 1 : null;

  if (page > lastPage) {
    throw new ORPCError("NOT_FOUND", {
      message: `Page ${page} not found. Last page is ${lastPage}`,
    });
  }

  return {
    data,
    meta: paginationMeta.parse({
      total,
      lastPage,
      currentPage,
      totalPerPage: size,
      prevPage,
      nextPage,
    }),
  };
};
