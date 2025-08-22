import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { appRouter } from "../../../server/src/routers";

export const getSession = async (header: Headers) => {
  const server = new RPCLink({
    url: `${process.env.NEXT_PUBLIC_SERVER_URL}/rpc`,
    headers: {
      "x-api-key": "password",
      ...Object.fromEntries(header.entries()),
    },
  });
  const serverLink: RouterClient<typeof appRouter> = createORPCClient(server);

  const session = await serverLink.getSession();

  return session;
};
