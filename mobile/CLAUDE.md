# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AGS Globalfarm** (package `com.progix.agsglobalfarmsarl`, Expo slug `ags-mobile`) is an Expo/React Native mobile application for agricultural job seekers and farm owners in Senegal. It provides job listings, training courses, and agricultural advice based on region/location.

## Tech Stack

- **Framework**: Expo SDK 55 with React Native 0.83.10
- **Routing**: expo-router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand stores in `src/stores/`
- **Backend**: the Next.js app in `../web` (REST under `/api`), via `src/lib/api/`
- **Auth**: better-auth + `@better-auth/expo`, tokens in expo-secure-store
- **Storage**: expo-secure-store (session), AsyncStorage (local cache)
- **Maps**: Mapbox via @rnmapbox/maps
- **Validation**: Zod
- **Package Manager**: bun (`bun.lock` is the only lockfile — do not add package-lock.json)

## Commands

```bash
bun install          # Install dependencies
bun start            # Start development server
bun run android      # Run on Android
bun run ios          # Run on iOS
bun run web          # Run web build
bun run lint         # Lint code with ESLint
bun run typecheck    # tsc --noEmit
bun run format       # Format code with Prettier
npx expo-doctor      # Validate project/config/dependency health
```

## Project Structure

- `src/app/` - File-based routing (Expo Router). Routes defined by file names:
  - `(tabs)/` - Bottom tab navigation screens
  - `(auth)/` - Authentication screens (login, signup, etc.)
  - `account/` - Account settings
  - `training/` - Training course screens
  - `jobs/` - Job listing and application screens
  - `support/` - Help and terms pages

- `src/components/ui/` - Reusable UI components (button, FormInput, FormPicker, StepIndicator)

- `src/stores/` - Zustand stores: `userStore`, `jobsStore`, `trainingStore`,
  `shopStore`, `ordersStore`, `mapStore`, `itineraryStore`, `authGateStore`

- `src/lib/api/` - Typed REST wrappers over the web backend. All requests go
  through `apiFetch` in `client.ts`, which reads `EXPO_PUBLIC_API_URL`.
  Use `resolveMediaUrl()` from that module for any image path returned by the
  API — never hardcode a deployment host.

- `src/lib/auth-client.ts` - better-auth client (session, OTP, one-time token)

- `src/data/` - Static reference data only (senegal-regions.ts, senegalData.ts,
  incident-categories.ts, itineraries.ts, agricultural-data.ts). Everything else
  comes from the API.

- `src/schemas/` - Zod validation schemas

- `src/types.d.ts` - TypeScript type definitions (all interfaces in one file)

## Architecture

State lives in Zustand stores, not context providers. Navigation uses
expo-router with two tab groups selected by role: `(tabs)` for `farm_owner`
and `(tabs-job-seeker)` for `job_seeker`. Path aliases: `@/*` maps to `src/*`.

Environment: `EXPO_PUBLIC_API_URL` (no trailing slash),
`EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`, and `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` (build
only, stored as an EAS secret). See `.env.example`.

## Key Patterns

- Store hooks follow naming convention: `useUserStore()`, `useJobsStore()`, `useTrainingStore()`
- UI components are in `src/components/ui/`
- Anything dev-only (the `dev-login` screen, `DEV_ACCOUNTS`) must sit behind
  `__DEV__` so it is stripped from release bundles
- Types are centralized in `src/types.d.ts` (not co-located with components)
- Form validation uses Zod schemas in `src/schemas/validation.ts`
- Senegal region/department data is in `src/data/senegal-regions.ts`

## Design Context

### Users

Agricultural job seekers and farm owners in Senegal — often in rural areas, potentially with limited tech experience. The interface must feel **warm and approachable** — friendly, welcoming, and easy to navigate.

### Brand Personality

**Grounded, Helpful, Local** — rooted in Senegalese agriculture, practical and community-oriented. A trusted local tool, not a flashy product.

### Aesthetic Direction

**Soft & organic** — rounded shapes, earth tones alongside greens/golds, gentle gradients. Avoid sharp edges and harsh contrasts.

### Design Principles

1. **Approachable first** — Inviting, not intimidating. Clear French labels, generous touch targets, forgiving interactions.
2. **Rooted in place** — Reflect Senegalese agriculture. Green/gold palette evokes growth and harvest.
3. **Gentle motion** — Animations serve comfort, not spectacle. Subtle fades, springs, and haptics.
4. **Content over chrome** — UI recedes so content takes center stage. White space is a feature.
5. **Accessible by default** — Large text, high-contrast actions, generous spacing, ≥44px touch targets.
