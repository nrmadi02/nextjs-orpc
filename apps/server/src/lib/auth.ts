import { prisma } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import "dotenv/config";

const baseURL = process.env.BETTER_AUTH_URL;

export const auth = betterAuth({
  baseURL: baseURL ?? "http://localhost:8080",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
    cookies: {
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          partitioned: true,
        },
      },
    },
  },
  trustedOrigins: ["http://localhost:3001"],
});
