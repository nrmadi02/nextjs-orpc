"use server";

import { headers } from "next/headers";
import { getSession } from "../utils/get-session";

export const getServerSideSession = async () => {
  const header = await headers();
  return getSession(header);
};
