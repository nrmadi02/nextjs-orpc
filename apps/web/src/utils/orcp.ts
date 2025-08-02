import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { RPCLink } from "@orpc/client/fetch";
import { QueryClient } from "@tanstack/react-query";
import type { appRouter } from "../../../server/src/routers/index";
import type { RouterClient } from "@orpc/server";

export const queryClient = new QueryClient();

export const link = new RPCLink({
	url: `${process.env.NEXT_PUBLIC_SERVER_URL}/rpc`,
});

export const client: RouterClient<typeof appRouter> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
