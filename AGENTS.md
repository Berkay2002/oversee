# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds Next.js App Router entries; treat folders under `app/(...)` as route boundaries and prefer server components unless a client hook is required.
- `components/` contains reusable UI primitives; co-locate styles through Tailwind classes rather than standalone CSS.
- `hooks/` and `lib/` host shared logic (custom React hooks, data helpers, API clients); keep side-effect code isolated in `lib`.
- `public/` serves static assets (images, icons, fonts); reference them with `/asset-name.ext`.
- Root configs such as `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `components.json` govern build, typing, linting, and design tokens—update them in tandem when modifying architecture.

## Build, Test, and Development Commands
- `npm run dev` spins up the local dev server at `http://localhost:3000` with hot reloading.
- `npm run build` generates an optimized production bundle; use before shipping major UI changes.
- `npm run start` serves the pre-built bundle for staging or smoke testing.
- `npm run lint` runs the ESLint suite; resolve all warnings before opening a PR.

## Coding Style & Naming Conventions
- TypeScript + React with functional components is standard; default exports should be avoided in favor of named exports for shared modules.
- Maintain two-space indentation, single quotes inside TSX only when interpolation forces it, and keep JSX props sorted by significance (structure → behavior → styling).
- Tailwind is the primary styling layer; compose classes with `clsx` and `tailwind-merge` to prevent duplication.
- Align with ESLint (`eslint-config-next`) suggestions—run `npm run lint -- --fix` for safe autofixes, then review manually.

## Testing Guidelines
- A formal test harness is not yet committed; when adding one, favor Next.js + Jest with `@testing-library/react` and colocate specs beside components as `<name>.test.tsx`.
- New features should include at least smoke coverage for rendered UI states and validation rules; document any gaps in the PR.
- Until automated tests exist, rely on `npm run lint` and manual QA in `npm run dev`; include reproduction steps in the PR description.

## Commit & Pull Request Guidelines
- Follow the existing history: imperative, concise messages such as `Add dashboard filters`—scope prefixes are optional but keep the first word capitalized.
- Group related changes per commit; avoid mixing refactors with feature work.
- PRs must describe intent, highlight UX impacts, link tracking issues, and attach screenshots or recordings for visible changes.
- Request review once CI (lint/tests) is green and list any follow-up tasks or known limitations in the PR notes.
