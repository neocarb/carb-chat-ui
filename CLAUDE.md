# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js chat UI for interacting with LangGraph agents. Forked from `langchain-ai/agent-chat-ui`, customized as `neocarb/carb-chat-ui`. Upstream remote is `upstream`.

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Production build
pnpm lint         # ESLint
pnpm lint:fix     # ESLint with auto-fix
pnpm format       # Prettier format
pnpm format:check # Check formatting
```

Package manager: **pnpm** (v10.5.1). No test suite is configured.

## Architecture

**Stack:** Next.js 15 (App Router), React 19, TypeScript 5.7, Tailwind CSS 4, Radix UI + Shadcn (new-york style)

### Key Directories

- `src/app/` — Next.js App Router. Single page app (`page.tsx` renders `DemoPage`). API proxy at `api/[..._path]/route.ts` using `langgraph-nextjs-api-passthrough` (Edge runtime).
- `src/providers/` — React Context providers:
  - `Stream.tsx` — LangGraph connection, setup form, streaming via `useStream` from `@langchain/langgraph-sdk/react`
  - `Thread.tsx` — Thread history, metadata search, thread state
  - `client.ts` — LangGraph SDK client factory
- `src/components/thread/` — Core chat UI. `index.tsx` is the main Thread component. Sub-directories: `messages/` (AI, human, tool calls, interrupts), `agent-inbox/` (interrupt action review UI), `history/` (thread history panel).
- `src/components/ui/` — Shadcn UI primitives
- `src/hooks/` — `use-file-upload.tsx` (multimodal input), `useMediaQuery.tsx`
- `src/lib/` — Utilities: `utils.ts` (cn helper), `api-key.tsx` (localStorage key management), `ensure-tool-responses.ts`, `agent-inbox-interrupt.ts`, `multimodal-utils.ts`

### Path Alias

`@/*` maps to `./src/*`

### State Management

React Context + hooks. URL query parameters persisted via `nuqs`. API keys stored in localStorage under `lg:chat:apiKey`.

### Message Filtering

Messages prefixed with `DO_NOT_RENDER_ID_PREFIX` ("do-not-render-") are hidden from the UI. The `langsmith:nostream` run name also hides messages.

### Environment Variables

- `NEXT_PUBLIC_API_URL` — LangGraph server URL (client-exposed)
- `NEXT_PUBLIC_ASSISTANT_ID` — Graph/assistant name or UUID (client-exposed)
- `LANGSMITH_API_KEY` — Server-only auth key (never prefix with `NEXT_PUBLIC_`)

### Deployment

Two production strategies: (1) API passthrough via `langgraph-nextjs-api-passthrough`, (2) custom authentication with manual header injection. Server actions have a 10MB body size limit.
