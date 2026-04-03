# FlowDesk

Freelancer workforce operations dashboard built with Next.js, Supabase, and Tailwind CSS.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials
4. Run the development server: `npm run dev`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features (Sprint 1)

- [x] Authentication (sign up / sign in)
- [ ] Add freelancer
- [ ] Freelancer roster view
- [ ] Onboarding checklist

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Auth + Database)
