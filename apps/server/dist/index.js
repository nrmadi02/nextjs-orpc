import { serve } from "@hono/node-server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { appRouter } from "./routers/index.js";
import "dotenv/config";
import { prisma } from "@repo/db";
const BODY_PARSER_METHODS = new Set([
    "arrayBuffer",
    "blob",
    "formData",
    "json",
    "text",
]);
const app = new Hono();
const handler = new RPCHandler(appRouter);
const port = Number(process.env.APP_PORT) || 3000;
app.use("*", cors({
    origin: ["http://localhost:3001"],
    credentials: true,
}));
app.use("/rpc/*", async (c, next) => {
    const request = new Proxy(c.req.raw, {
        get(target, prop) {
            if (BODY_PARSER_METHODS.has(prop)) {
                return () => c.req[prop]();
            }
            return Reflect.get(target, prop, target);
        },
    });
    const { matched, response } = await handler.handle(request, {
        prefix: "/rpc",
        context: {
            header: c.req.header,
            db: prisma,
        },
    });
    if (matched) {
        return c.newResponse(response.body, response);
    }
    await next();
});
serve({
    fetch: app.fetch,
    port,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
