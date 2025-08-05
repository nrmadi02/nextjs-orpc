import { publicProcedure } from "../lib/orpc.js";
import { chatRouter } from "./chat.router.js";
import { postRouter } from "./post.router.js";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  post: postRouter,
  chat: chatRouter,
};
export type AppRouter = typeof appRouter;
