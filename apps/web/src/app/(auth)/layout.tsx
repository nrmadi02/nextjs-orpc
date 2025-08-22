import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getServerSideSession } from "@/lib/server-session";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, user } = await getServerSideSession();

  if (session && user) {
    console.log("User already logged in");
    return redirect("/");
  }

  return children;
}
