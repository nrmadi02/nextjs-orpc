import { publicProcedure } from "../lib/orpc.js";
import secureMiddleware from "../middleware/secure.middleware.js";
import { chatRouter } from "./chat.router.js";
import { postRouter } from "./post.router.js";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  getSession: publicProcedure.use(secureMiddleware).handler(({ context }) => {
    if (!context.session) {
      return {
        session: null,
        user: null,
      };
    }
    return {
      session: context.session,
      user: context.user,
    };
  }),
  post: postRouter,
  chat: chatRouter,
};
export type AppRouter = typeof appRouter;
