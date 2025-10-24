# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a **Next.js 16** application using the **App Router** architecture with **React 19**, **TypeScript**, and **Tailwind CSS v4**.

### Technology Stack
- **Framework**: Next.js 16.0.0 with App Router
- **React**: 19.2.0
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Theme Management**: next-themes for dark/light mode switching
- **Form Handling**: react-hook-form with @hookform/resolvers
- **Validation**: Zod v4
- **Icons**: Lucide React

### Directory Structure
```
oversee/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx         # Root layout with ThemeProvider
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles and Tailwind imports
├── components/            # React components
│   ├── ui/               # shadcn/ui components (50+ components)
│   └── theme-provider.tsx # Theme provider wrapper
├── hooks/                # Custom React hooks
│   └── use-mobile.ts
├── lib/                  # Utility functions and helpers
│   └── utils.ts          # cn() utility for Tailwind classes
├── public/               # Static assets
└── [config files]        # Various configuration files
```

### Path Aliases
- `@/*` maps to the project root
- Import example: `import { Button } from "@/components/ui/button"`

### MCP Servers Configured
Three MCP servers are configured in `.mcp.json`:
1. **next-devtools**: Next.js development tools and diagnostics
2. **supabase**: Supabase database integration (project: hzowvejjmnamhnrbqpou)
3. **shadcn**: shadcn/ui component management

## Development Commands

### Core Commands
- `npm run dev` - Start development server at http://localhost:3000 with hot reloading
- `npm run build` - Create production build (avoid running if localhost:3000 is active)
- `npm run start` - Run production server from build output
- `npm run lint` - Run ESLint with eslint-config-next rules

### Important Notes
- **Never run `npm run build`** if the development server (localhost:3000) is already running
- Development server includes Fast Refresh for instant feedback
- ESLint uses Next.js configuration with TypeScript support

## shadcn/ui Integration

**CRITICAL**: Before working with any shadcn/ui components, **ALWAYS read** `.shadcn/llms.txt` first. This file contains comprehensive documentation about:
- Available components and their usage
- Installation and configuration
- Component patterns and best practices
- Form handling and validation approaches
- Dark mode implementation
- Registry system and MCP server usage

### shadcn/ui Configuration
- Style: **new-york**
- Base color: **neutral**
- CSS variables: **enabled**
- RSC (React Server Components): **enabled**
- Icon library: **lucide**
- Components location: `@/components/ui`

### Component Management
Use the shadcn MCP server or CLI to add new components (Prioritize the CLI):
```bash
npx shadcn@latest add [component-name]
```

## Styling Approach

### Tailwind CSS v4
- Configuration via `postcss.config.mjs` using `@tailwindcss/postcss`
- Global styles in `app/globals.css`
- CSS variables for theming (defined in globals.css)

### Class Composition
Use the `cn()` utility from `lib/utils.ts` to merge Tailwind classes:
```typescript
import { cn } from "@/lib/utils"

<div className={cn("base-classes", conditionalClasses)} />
```

## Theme Management

The application supports light/dark mode using `next-themes`:
- Provider: `ThemeProvider` in `components/theme-provider.tsx`
- Configured in root layout with `attribute="class"` and `defaultTheme="system"`
- Respects user's system preferences by default

## TypeScript Configuration

- Target: ES2017
- Strict mode: enabled
- JSX: react-jsx (React 19)
- Module resolution: bundler
- Incremental builds: enabled

## Git Workflow

### Commit Guidelines
- Write imperative, concise messages
- Do not include your name or personal identifiers in commit messages
- Keep commits focused on single logical changes

### Current Branch Status
- Active branch: `master`
- Uncommitted changes exist in app/, package files, and new component directories
