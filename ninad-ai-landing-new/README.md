# NINAD-AI — Marketing Landing Page 🚀

**A fast, responsive landing page built with Next.js (App Router) and Tailwind CSS.** This repository contains the frontend for NINAD-AI's marketing site — modular components, accessibility-focused markup, and optimised performance by default.

---

## Overview ✅

This project is a Next.js 16 app (Turbopack) using the App Router and TypeScript. It provides a clean, component-driven landing page with the following pre-built components:
- `Header`, `Hero`, `Features`, `Comparison`, `Products`, `Pricing`, `UseCases`, `Waitlist`, `Languages`, `Footer` (see `app/components/`)

The site uses Tailwind CSS for styling and PostCSS for processing. It's easy to extend and customize to match your brand.

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
