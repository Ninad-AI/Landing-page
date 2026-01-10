# NINAD-AI — Marketing Landing Page

Fast, responsive landing page built with Next.js (App Router) and Tailwind CSS.

---

## Overview ✅

This project is a Next.js 16 app (Turbopack) using the App Router and TypeScript. It provides a clean, component-driven landing page with the following pre-built components:
- `Header`, `Hero`, `Features`, `Comparison`, `Products`, `Pricing`, `UseCases`, `Waitlist`, `Languages`, `Footer` (see `app/components/`)

The site uses Tailwind CSS for styling and PostCSS for processing. It's easy to extend and customize to match your brand.

This repo also includes:
- A dedicated **Book Demo** page at `/book-demo`
- Supabase-backed form submissions for:
  - Waitlist signup (`/api/waitlist` → `waitlist_subscribers`)
  - Demo requests (`/api/book-demo` → `demo_requests`)

---

## Features ✨

- Responsive layout and accessible components
- Built with Next.js App Router + TypeScript
- Tailwind CSS for utility-first styling
- Fast dev feedback with Turbopack
- Clean component structure for easy maintenance

---

## Tech Stack 🔧

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS, PostCSS
- ESLint for linting

---

## Quick Start — Local Development 🛠️

Prerequisites:
- Node.js v18 or later
- npm (bundled with Node)

Commands:

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run the production build locally
npm start

# Run linter
npm run lint
```

Open http://localhost:3000 in your browser. Changes to files under `app/` will hot-reload.

> Tip: If you need a specific Node version, use nvm (or nvm-windows) to manage versions.

---

## Project Structure 📁

- `app/` - main Next.js App Router source
  - `layout.tsx`, `page.tsx`, `globals.css`
  - `components/` - reusable UI components (see names above)
- `public/` - static assets
- `package.json` - scripts and deps
- `tailwind.config.js`, `postcss.config.mjs` - styling config

---

## Book Demo Page

- Route: `/book-demo`
- Navbar links (Features/Products/Use Cases/Pricing) route back to `/#...` sections from this page.

---

## Supabase Setup

### 1) Environment variables

Create a local env file (not committed):

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Use [.env.example](.env.example) as a template.

### 2) Required tables

The API routes expect these tables:

- `waitlist_subscribers`
  - `id` (uuid)
  - `email` (text)
  - `created_at` (timestamptz)

- `demo_requests`
  - `id` (uuid)
  - `created_at` (timestamptz)
  - `name` (text)
  - `email` (text)
  - `phone` (text)
  - `company` (text)

Note: The Book Demo form also collects “What are you building?” currently for UX, but it is not stored unless you add a `message` column.

### 3) RLS policies (if you use the anon key)

If Row Level Security is enabled, allow inserts for the `anon` role.

```sql
-- Waitlist inserts
alter table public.waitlist_subscribers enable row level security;

create policy "public can insert waitlist_subscribers"
on public.waitlist_subscribers
for insert
to anon
with check (true);

-- Demo request inserts
alter table public.demo_requests enable row level security;

create policy "public can insert demo_requests"
on public.demo_requests
for insert
to anon
with check (true);
```

Optional: prevent duplicate waitlist emails:

```sql
create unique index if not exists waitlist_subscribers_email_key
on public.waitlist_subscribers (lower(email));
```

---

## Deploying 🔁

Recommended: Deploy to Vercel for seamless integration with Next.js features (Edge functions, CDN, analytics).

Basic steps:
1. Connect this repo in Vercel
2. Set the build command to `npm run build` and the output directory will be handled by Next.js

You can also build and serve by running `npm run build` then `npm start` on any Node-capable host.

---

## Customization & Development Tips 💡

- Modify components in `app/components/` and update `app/layout.tsx` for global changes
- Add new pages using the App Router conventions (`app/<route>/page.tsx`)
- Extend Tailwind in `tailwind.config.js` to add brand colors or utilities

---

## Contributing 🤝

Contributions are welcome! Please open an issue or a PR with a clear description of the change. If you add features, include tests or screenshots when applicable.

Guidelines:
- Follow the existing code style (TypeScript + Tailwind)
- Keep components small and focused
- Run the linter before creating a PR: `npm run lint`

---

## License 📄

No license file is included in this repo yet. If you want to make this open source, consider adding an `LICENSE` (e.g., **MIT**) file.

---

## Contact ✉️

For questions or help: open an issue in this repo or contact the project owner.

---

Enjoy building! 🎉
