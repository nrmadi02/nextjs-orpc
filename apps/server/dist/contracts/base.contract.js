import z from "zod";
export const baseContract = (data) => z.object({
    message: z.string(),
    data: data,
});
