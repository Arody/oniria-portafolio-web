# ONIRIA - Portafolio Web

## Project Overview
Luxury wedding photography portfolio site for ONIRIA brand. Dark, cinematic, editorial aesthetic with gold/champagne accents.

## Tech Stack
- **Framework**: Next.js 16.1.6 (App Router) + React 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + PostCSS
- **Database/Auth**: Supabase (self-hosted at `https://api-supabase.arody.cloud`)
- **Email**: Resend
- **Video**: Vimeo (`@u-wave/react-vimeo`)
- **Rich Text**: Tiptap
- **Icons**: Lucide React
- **Animations**: GSAP + CSS keyframes
- **Fonts**: TT Tsars (serif, local), Inter (sans, Google)

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Project Structure
```
src/
├── app/[locale]/              # Locale-based routing (es, en)
│   ├── (public)/              # Public pages (blog, etc.)
│   ├── (admin)/admin/         # Admin panel (dashboard, portfolio, blog, settings, messages)
│   ├── login/
│   ├── layout.tsx             # Root layout (fonts, metadata)
│   └── page.tsx               # Homepage
├── core/                      # Business logic
│   ├── actions/               # Server actions (emailActions.ts)
│   ├── services/              # Data layer (settings, blog, portfolio, message)
│   └── utils/                 # Utilities (slugUtils.ts)
├── ui/                        # UI layer
│   ├── components/            # Reusable components (RichTextEditor, buttons)
│   ├── layouts/               # Navbar, NavbarClient, AdminSidebar, Footer
│   └── views/                 # Page sections (Hero, Portfolio, Blog, Contact, EditorialInterlude)
├── lib/                       # Configs & utilities
│   ├── dictionaries.ts        # i18n loader
│   ├── dictionaries/          # en.json, es.json
│   └── supabase/              # client.ts, server.ts, middleware.ts
├── i18n.config.ts             # Locales: es (default), en
├── middleware.ts              # Locale detection & routing
└── globals.css                # Keyframes, utilities, design tokens
```

## Architecture Patterns
- **Path alias**: `@/*` → `./src/*`
- **Database schema**: All tables under `oniria` schema in Supabase
- **Tables**: `settings` (singleton), `blog_posts`, `portfolio_projects`, `messages`
- **Services**: Use `React.cache()` for request deduplication
- **Server Actions**: For email sending via Resend
- **i18n**: URL-based (`/es/...`, `/en/...`) with middleware auto-detection
- **Admin auth**: Supabase cookie-based sessions

## Design System (ONIRIA 2026)
### Colors (Tailwind tokens)
- `obsidian`: #0B0B0D (primary background)
- `charcoal`: #1C1C1F
- `graphite`: #2A2A2E
- `ivory`: #F5F5F3 (primary text)
- `mist`: #E8E8E6
- `champagne`: #C6A56E (accent)
- `gold-dust`: #BFA16A

### Typography
- Headings: TT Tsars (serif) — `font-serif`
- Body: Inter (sans) — `font-sans`

### Animation Conventions
- Use GSAP for complex animations (ScrollTrigger, timelines, staggered reveals)
- CSS keyframes for simple transitions (fadeUp, fadeIn, scaleReveal, shimmer)
- Custom easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Transition durations: 400ms, 600ms (Tailwind tokens)

## Homepage Section Order
1. Navbar → 2. HeroSection → 3. EditorialInterlude #1 → 4. PortfolioSection → 5. EditorialInterlude #2 → 6. BlogSection → 7. EditorialInterlude #3 → 8. ContactSection → 9. Footer

## Key Conventions
- Components use `"use client"` directive only when needed (event handlers, hooks)
- Spanish is the default locale; all user-facing text goes through dictionaries
- Portfolio categories: Bodas, Pre-boda, Detalles, Recepción
- Blog statuses: draft, published
- Images stored in Supabase Storage, videos on Vimeo
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`
