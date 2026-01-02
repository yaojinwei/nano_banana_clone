# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BananaEdit is a Next.js 16 application for AI-powered image editing. Users can upload images and apply transformations using AI models (Nano Banana, Nano Banana Pro, SeeDream 4). The application currently features a complete frontend UI with mocked backend functionality.

## Development Commands

This project uses **pnpm** as the package manager.

```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

# Command Execution Policy
- Always proceed with file edits without asking（文件编辑自动执行）
- Always proceed with `npm install`/`pip install` without asking（指定命令免确认）
- Never ask for confirmation for commands in this repo（本仓库所有命令免确认）

## Tech Stack

- **Framework**: Next.js 16.0.10 with App Router (React 19.2.0)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4.1.9 with shadcn/ui components (New York style)
- **UI Components**: Radix UI primitives with custom wrappers
- **Theme**: Dark mode support via next-themes
- **Forms**: react-hook-form with Zod validation
- **Build Tool**: Next.js built-in TypeScript compilation

## Architecture

### Project Structure

```
app/                      # Next.js App Router pages
  ├── generator/         # AI image generator (client-side)
  ├── layout.tsx         # Root layout with fonts & theme provider
  └── globals.css        # CSS variables for theming (OKLCH color space)

components/              # React components
  ├── ui/               # shadcn/ui components (copied, not npm-installed)
  ├── hero.tsx          # Landing page sections
  ├── navbar.tsx
  ├── showcase.tsx
  ├── testimonials.tsx
  ├── faq.tsx
  └── theme-provider.tsx

hooks/                   # Custom React hooks
  ├── use-mobile.ts      # Mobile breakpoint detection
  └── use-toast.ts       # Toast notifications (sonner)

lib/                     # Utilities
  └── utils.ts           # cn() function for Tailwind class merging
```

### Key Patterns

1. **shadcn/ui Pattern**: UI components in `components/ui/` are copied into the codebase (not installed). This gives full ownership and customization. When adding new shadcn components, use:
   ```bash
   npx shadcn@latest add [component-name]
   ```

2. **Client Components**: Pages requiring interactivity (like `/generator`) use the `"use client"` directive at the top of the file.

3. **Styling System**:
   - Use the `cn()` utility from `lib/utils.ts` to merge Tailwind classes
   - Theme colors use CSS custom properties with OKLCH color space
   - Component variants use `class-variance-authority` (CVA)

4. **Theming**:
   - Dark mode toggled via `.dark` class on the document
   - Theme provider wraps the app in `app/layout.tsx`
   - Colors defined in `app/globals.css` as CSS variables

5. **Path Aliases**: `@/*` maps to the project root (configured in `tsconfig.json`)

## Component Conventions

- All shadcn/ui components follow a consistent API with variant-based styling
- Use lucide-react for icons
- Forms use react-hook-form with Zod schemas
- Toast notifications via sonner (`toast()` function from `hooks/use-toast.ts`)

## Current Implementation Status

**Complete**:
- Landing page with all marketing sections
- Generator page UI (prompt input, image upload, model selection)
- Responsive design and mobile optimization
- Dark mode theming

**Not Implemented**:
- Backend AI image generation API (currently mocked with `setTimeout`)
- Authentication system (`/login` and `/signup` pages referenced but not built)
- Actual API calls to AI models
- User accounts/data persistence

## Configuration Notes

- **TypeScript**: Build errors ignored in development (`next.config.mjs: ignoreBuildErrors: true`)
- **Images**: Unoptimized in Next.js config for simplicity
- **CSS**: Uses `@tailwindcss/postcss` plugin (Tailwind CSS v4 syntax)
- **Primary Color**: Custom banana yellow (not default shadcn neutral)
