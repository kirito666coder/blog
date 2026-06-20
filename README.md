# Blog Monorepo

A full-stack technical blog platform with a **Next.js web app** and an **Expo mobile app**, managed as a **pnpm workspace**.

The web app includes a public blog, GitHub authentication, an admin dashboard, and MongoDB-backed content. The mobile app consumes the web API and renders blog posts with NativeWind styling.

## Packages

| Package    | Path                  | Description                                                            |
| ---------- | --------------------- | ---------------------------------------------------------------------- |
| **Web**    | [`web/`](./web)       | Next.js 16 App Router site — landing page, blog, admin panel, REST API |
| **Mobile** | [`mobile/`](./mobile) | Expo Router app — blog reader for iOS, Android, and web                |

## Tech Stack

### Web (`web/`)

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/) + [Zod](https://zod.dev/) validation
- [NextAuth.js v5](https://authjs.dev/) (GitHub provider)
- [Three.js](https://threejs.org/) / React Three Fiber for 3D visuals
- [GSAP](https://gsap.com/) for animations

### Mobile (`mobile/`)

- [Expo 54](https://expo.dev/) + [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native 0.81](https://reactnative.dev/)
- [NativeWind 4](https://www.nativewind.dev/)
- Markdown rendering with syntax highlighting (Shiki)

### Tooling (root)

- [pnpm](https://pnpm.io/) workspaces
- [ESLint 9](https://eslint.org/) flat config (shared base + per-package overrides)
- [Prettier](https://prettier.io/) + [Husky](https://typicode.github.io/husky/) pre-commit hooks

## Project Structure

```
blog/
├── eslint.config.mjs      # Shared ESLint base (imported by web & mobile)
├── package.json           # Root scripts: lint, format, husky
├── pnpm-workspace.yaml
├── web/
│   ├── src/app/           # Next.js routes (public, admin, API)
│   ├── src/components/    # UI, 3D, theme, animations
│   ├── src/db/            # MongoDB connection & services
│   └── eslint.config.mjs  # Next.js + shared base rules
└── mobile/
    ├── app/               # Expo Router screens
    ├── api/               # Axios client for web API
    └── eslint.config.mjs  # Expo + shared base rules
```

## Prerequisites

- **Node.js** 20+
- **pnpm** 10+
- **MongoDB Atlas** (or local MongoDB) for the web app
- **GitHub OAuth app** for authentication
- **Expo Go** or a simulator/emulator for mobile development

## Getting Started

### 1. Install dependencies

From the repository root:

```bash
pnpm install
```

### 2. Configure the web app

Create `web/.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# NextAuth / Auth.js
AUTH_SECRET=your-random-secret-at-least-32-chars
AUTH_GITHUB_ID=your-github-oauth-client-id
AUTH_GITHUB_SECRET=your-github-oauth-client-secret
NEXTAUTH_URL=http://localhost:4000
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Run the web app

```bash
pnpm --dir web dev
```

Open [http://localhost:4000](http://localhost:4000).

### 4. Run the mobile app

```bash
pnpm --dir mobile start
```

The mobile API client points to the deployed web API by default (`mobile/api/client.ts`). Update `baseURL` to `http://localhost:4000/api/` when testing against a local web server.

## Scripts

Run these from the **repository root** unless noted.

| Command                     | Description                                             |
| --------------------------- | ------------------------------------------------------- |
| `pnpm lint`                 | Lint root, web, and mobile                              |
| `pnpm lint:web`             | Lint web only                                           |
| `pnpm lint:mobile`          | Lint mobile only                                        |
| `pnpm lint:fix`             | Auto-fix lint issues across the monorepo                |
| `pnpm format`               | Format all files with Prettier                          |
| `pnpm format:check`         | Check formatting without writing                        |
| `pnpm --dir web dev`        | Start Next.js dev server (port 4000)                    |
| `pnpm --dir web build`      | Production build (uses `cross-env NODE_ENV=production`) |
| `pnpm --dir web start`      | Start production server                                 |
| `pnpm --dir mobile start`   | Start Expo dev server                                   |
| `pnpm --dir mobile android` | Open on Android emulator                                |
| `pnpm --dir mobile ios`     | Open on iOS simulator                                   |

## Web Features

- **Public site** — animated landing page, blog listing, and slug-based blog detail pages
- **Authentication** — GitHub sign-in via NextAuth; users stored in MongoDB
- **Admin panel** (`/admin`) — dashboard, user management, blog CRUD (create, review, publish/draft)
- **API routes** — `/api/blogs`, `/api/blogs/[slug]`, `/api/auth/[...nextauth]`
- **Static generation** — blog slugs pre-rendered via `generateStaticParams`; admin routes are dynamic

Admin routes use `export const dynamic = 'force-dynamic'` so they are not pre-rendered at build time and do not require a live database during `next build`.

## ESLint Setup

ESLint is configured as a **shared flat config**:

- **Root** [`eslint.config.mjs`](./eslint.config.mjs) — shared TypeScript, Prettier, and React Hooks rules
- **Web** [`web/eslint.config.mjs`](./web/eslint.config.mjs) — extends base + `eslint-config-next`
- **Mobile** [`mobile/eslint.config.mjs`](./mobile/eslint.config.mjs) — extends base + `eslint-config-expo`

Web and mobile are linted from their own directories so framework plugins resolve paths correctly.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`:

1. `pnpm lint`
2. `pnpm format:check`
3. `pnpm --dir web build` (with auth and MongoDB secrets)
4. `pnpm --dir mobile tsc --noEmit`

Required GitHub secrets for the web build:

- `MONGODB_URI`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `NEXTAUTH_URL`

## Build Notes

The web build script uses `cross-env NODE_ENV=production` so production builds succeed even if your shell has `NODE_ENV=development` set globally (common on Windows). Next.js expects `NODE_ENV=production` during `next build`.

If you see MongoDB connection warnings during build for public blog pages, ensure Atlas network access allows your IP or use dummy/fallback data for static generation. Admin pages are already excluded from static prerender.

## License

This project is licensed under the [MIT License](LICENSE).
