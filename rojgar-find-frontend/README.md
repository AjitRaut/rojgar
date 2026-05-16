# Rojgar Find - Frontend

AI-powered daily-job platform. Next.js 14 + TypeScript + Tailwind + ShadCN + Redux Toolkit + React Query.

## Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN UI primitives
- **State**: Redux Toolkit (auth) + React Query (server state)
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios (with JWT auto-refresh)
- **Animation**: Framer Motion
- **Icons**: lucide-react

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL to your backend URL

# 3. Run dev server
npm run dev
# Opens http://localhost:3000

# 4. Production build
npm run build
npm start
```

## Environment variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Scripts

| Script             | Purpose                       |
| ------------------ | ----------------------------- |
| `npm run dev`      | Dev server (hot reload)       |
| `npm run build`    | Production build              |
| `npm start`        | Run built app                 |
| `npm run lint`     | ESLint                        |
| `npm run type-check` | TypeScript check, no emit   |

## Project structure

```
src/
├── app/
│   ├── (auth)/         # login, register
│   ├── (dashboard)/    # all logged-in pages
│   │   ├── admin/      # admin panel
│   │   ├── jobs/       # jobs list, new, [id], my, applications
│   │   ├── workers/    # search + detail
│   │   ├── worker-profile/
│   │   ├── company-profile/
│   │   ├── profile/    # account
│   │   ├── ai/         # AI tools
│   │   └── complaints/
│   ├── layout.tsx      # root layout + providers
│   └── page.tsx        # landing page
├── components/
│   ├── ui/             # ShadCN primitives
│   ├── layout/         # Sidebar, Navbar, DashboardShell
│   ├── shared/         # Logo, StatCard, States, etc.
│   ├── jobs/           # JobCard
│   ├── workers/        # WorkerCard
│   └── ai/             # ChatWidget
├── lib/
│   ├── api/            # axios client + per-resource API modules
│   ├── hooks/          # React Query + Redux hooks
│   ├── stores/         # Redux store, auth slice, typed hooks
│   ├── validators/     # Zod schemas
│   ├── constants.ts
│   └── utils.ts
├── providers/          # Redux, React Query, Theme
├── types/api.ts        # all API types
├── middleware.ts       # security headers
└── ...
```

## Auth flow

1. User logs in → backend returns `{ user, tokens }`
2. Redux `setSession` saves tokens to `localStorage` + state
3. Axios interceptor attaches `Authorization: Bearer <token>` on every request
4. On 401, interceptor calls `/auth/refresh` with refresh token, retries original request
5. `DashboardShell` checks token on mount, redirects to `/login` if missing

## Roles

- `customer` - can post jobs, hire workers
- `worker` - can apply to jobs, build profile
- `company` - can post bulk jobs, manage company profile
- `admin` - moderate users, complaints, view analytics

## AI features

All powered by backend `/ai/*` endpoints (OpenAI):

- **Chat widget** (floating, all roles) - "Rojgar Sahayak" assistant
- **Auto-categorize job** (job creation) - Sets title, category, skills from description
- **Wage suggestion** (job creation) - Fair daily wage based on skill, city, exp
- **Bio optimizer** (worker profile) - Rewrites bio professionally
- **Worker recommendations** (AI tab) - Match-score ranked list

## Theme

- Light / Dark / System
- Toggle in navbar
- Persisted via `next-themes`
- CSS variables in `globals.css` (HSL format)

## Production deployment

### Vercel (recommended)

1. Push to GitHub
2. Import on Vercel
3. Set environment variables in dashboard
4. Deploy

### Docker

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

## Security

- CSP, HSTS, X-Frame-Options, X-Content-Type-Options headers (next.config.mjs)
- Tokens in localStorage (XSS risk acceptable for a college MVP; switch to httpOnly cookies for production)
- All API calls go through axios client with JWT interceptor

## Notes

- All UI is mobile-first responsive (tested 320px → 4K)
- Type-safe end to end (matches backend Pydantic schemas)
- Accessible: keyboard nav, focus rings, semantic HTML, ARIA labels
- 20 routes, all type-checked, build passes clean
