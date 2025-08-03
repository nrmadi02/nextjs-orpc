"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { orpc } from "@/utils/orcp";

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 `;

export default function Home() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  const posts = useQuery(
    orpc.post.listPost.queryOptions({
      input: {
        limit: 10,
        page: 1,
      },
    })
  );

  useEffect(() => {
    async function testFetch() {
      const healthCheck = await orpc.healthCheck.call();
      console.log(healthCheck);
    }
    testFetch();
  }, []);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <p>{healthCheck.data}</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Posts</h2>
          <ul>
            {posts.data?.data.map((post) => (
              <li key={post.id}>{post.title}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
