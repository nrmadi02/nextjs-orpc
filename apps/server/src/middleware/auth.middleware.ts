import { ORPCError } from "@orpc/client";
import { o } from "../lib/orpc";

const authMiddleware = o.middleware(async ({ context, next }) => {
  const session = context.session;

  if (!session) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Unauthorized",
    });
  }

  return next();
});

export default authMiddleware;
