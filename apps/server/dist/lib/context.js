import { prisma } from "@repo/db";
export async function createContext(req) {
    return {
        header: req.header,
        db: prisma,
    };
}
