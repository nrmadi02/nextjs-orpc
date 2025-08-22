import { createAuthClient } from "better-auth/react";

const url = process.env.NEXT_PUBLIC_SERVER_URL;

export const authClient = createAuthClient({
  baseURL: url ?? "http://localhost:8080",
  fetchOptions: {
    credentials: "include",
  },
});
