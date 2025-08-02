import z from "zod";

export const baseContract = <T>(data: T) =>
  z.object({
    message: z.string(),
    data: data,
  });
