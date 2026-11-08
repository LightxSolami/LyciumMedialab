# Lycium MediaLab

The magazine is a React + TypeScript application built with Vite. Its editorial templates remain separate from application code, while the six interactive prototypes and Supabase client are organized as feature modules.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```powershell
npm install
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` to configure the public media library. These values are included in the browser bundle: only use a publishable/anon key. Never put a Supabase secret or service-role key in frontend environment variables.

Run `supabase-setup.sql` in the Supabase SQL Editor to create the catalog tables, policies, and video bucket.

## Build and preview

```powershell
npm run build
npm run lint
npm run preview
```

The production site is emitted to `dist/`.

## Source layout

```text
src/
  components/  Shared React shell and static-template view component
  content/     Editorial HTML fragments, separated by page
  data/        Typed editorial and presentation content
  features/    Supabase client integration
  games/       J01-J06 interactive game modules and shared DOM helper
  legacy/      Existing route, publishing, and editorial-interaction runtime
  pages/       React page composition for each magazine view
  styles/      Site-wide responsive stylesheet
  utils/       Shared formatting helpers
public/assets/ Editorial artwork served unchanged
```

The legacy runtime remains isolated behind the React app entry point to preserve existing game behavior during the migration. New UI and features should be added as typed React components and feature modules rather than appended to that runtime.
