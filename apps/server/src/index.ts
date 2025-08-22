import { serve } from "@hono/node-server";
import { onError } from "@orpc/client";
import { RPCHandler } from "@orpc/server/fetch";
import { prisma } from "@repo/db";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import validationErrorInterceptor from "./interceptors/error-validation.interceptor.js";
import { appRouter } from "./routers/index.js";
import "dotenv/config";
import { auth } from "./lib/auth.js";

const BODY_PARSER_METHODS = new Set([
  "arrayBuffer",
  "blob",
  "formData",
  "json",
  "text",
] as const);

type BodyParserMethod = typeof BODY_PARSER_METHODS extends Set<infer T>
  ? T
  : never;

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const handler = new RPCHandler(appRouter, {
  interceptors: [onError(validationErrorInterceptor)],
});
const port = Number(process.env.APP_PORT) || 3000;

app.use(logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3001"],
    credentials: true,
  })
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.use("/rpc/*", async (c, next) => {
  const request = new Proxy(c.req.raw, {
    get(target, prop) {
      if (BODY_PARSER_METHODS.has(prop as BodyParserMethod)) {
        return () => c.req[prop as BodyParserMethod]();
      }
      return Reflect.get(target, prop, target);
    },
  });

  const { matched, response } = await handler.handle(request, {
    prefix: "/rpc",
    context: {
      req: c.req,
      db: prisma,
      session: c.get("session") || null,
      user: c.get("user") || null,
    },
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

serve(
  {
    fetch: app.fetch,
    port,
  },
  async (info) => {
    await prisma.$connect();
    console.log("Database connected");
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
