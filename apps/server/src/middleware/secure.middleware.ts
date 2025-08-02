import { ORPCError } from "@orpc/client";
import { o } from "../lib/orpc";

const secureMiddleware = o.middleware(async ({ context, next }) => {
  const apiKey = context.req.header("x-api-key");
  const existApiKey = "password";

  if (!apiKey) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "API key not found",
    });
  }

  if (apiKey !== existApiKey) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Invalid API key",
    });
  }

  return next();
});

export default secureMiddleware;
