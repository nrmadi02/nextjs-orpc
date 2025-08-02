import { serve } from "@hono/node-server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { appRouter } from "./routers/index.js";
import "dotenv/config";
import { prisma } from "@repo/db";
import { logger } from "hono/logger";

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

const app = new Hono();
const handler = new RPCHandler(appRouter);
const port = Number(process.env.APP_PORT) || 3000;

app.use(
  "*",
  cors({
    origin: ["http://localhost:3001"],
    credentials: true,
  })
);

app.use(logger());

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
    },
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

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
