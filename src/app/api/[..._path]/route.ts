import { initApiPassthrough } from "langgraph-nextjs-api-passthrough";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// This file acts as a proxy for requests to your LangGraph server.
// Read the [Going to Production](https://github.com/langchain-ai/agent-chat-ui?tab=readme-ov-file#going-to-production) section for more information.

const passthrough = initApiPassthrough({
  apiUrl: process.env.LANGGRAPH_API_URL ?? "remove-me",
  apiKey: process.env.LANGSMITH_API_KEY ?? "remove-me",
  runtime: "edge",
});

export const runtime = "edge";

function withAuth(
  handler: (req: NextRequest, ctx: any) => Promise<Response>,
) {
  return async (req: NextRequest, ctx: any) => {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, ctx);
  };
}

export const GET = withAuth(passthrough.GET);
export const POST = withAuth(passthrough.POST);
export const PUT = withAuth(passthrough.PUT);
export const PATCH = withAuth(passthrough.PATCH);
export const DELETE = withAuth(passthrough.DELETE);
export const OPTIONS = passthrough.OPTIONS;
