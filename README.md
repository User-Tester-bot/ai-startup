<div align="center">
  <img src="readme-illustration.png" alt="Readme Illustration" width="700" />
</div>

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Thanks to the Design Creator
This project uses the free design ["AI Startup Website UI Kit"](https://www.figma.com/design/cAYTeJQoDsad7pPMHA9xjd).
Big thanks to the creators for providing such a fantastic resource for the community!

## Getting Started

First, run the development server (I prefer to use `pnpm` as package manager, but you can use `npm` or `yarn` as well):

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:1912](http://localhost:1912) with your browser to see the result.

[//]: # (TODO: deploy the app on Vercel and add the link here)

## The product app

This repo contains both the **marketing site** and a **working product app** behind it.

- **Auth** — email/password sign up & sign in, scrypt-hashed passwords, and DB-backed
  session cookies. Unauthenticated visits to `/dashboard` redirect to `/login`.
- **Dashboard** (`/dashboard`) — usage stats and recent conversations.
- **AI Assistant** (`/dashboard/assistant`) — a streaming AI chat that turns a rough
  topic into SEO assets (titles, meta descriptions, keyword clusters, outlines).
  Conversations and messages are persisted per user.

### AI provider

The assistant works **out of the box with no API key** using a built-in offline engine.
To route requests to a live model, set any OpenAI-compatible endpoint (see `.env.example`):

```bash
OPENAI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1   # optional
AI_MODEL=gpt-4o-mini                    # optional
```

If the live provider errors before emitting tokens, the app transparently falls back to
the built-in engine.

### Storage

Persistence uses Node's built-in SQLite driver (`node:sqlite`, Node >= 22.5) — no native
modules or extra dependencies. The database is created on first use at `.data/app.db`
(git-ignored); override with `DATABASE_PATH`.

### Routes

| Route | Description |
| --- | --- |
| `/` | Marketing landing page |
| `/login`, `/signup` | Authentication |
| `/dashboard` | Product overview |
| `/dashboard/assistant` | AI assistant (streaming chat) |
| `/api/chat` | Streaming chat endpoint (SSE) |


