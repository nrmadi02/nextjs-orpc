import { publicProcedure } from "../lib/orpc.js";
import { postRouter } from "./post.router.js";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	post: postRouter,
};
export type AppRouter = typeof appRouter;
