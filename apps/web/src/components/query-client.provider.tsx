"use client";

import { QueryClientProvider as TanStackQueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/orcp";
import type { ReactNode } from "react";

export default function QueryClientProvider({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<TanStackQueryClientProvider client={queryClient}>
			{children}
		</TanStackQueryClientProvider>
	);
}
