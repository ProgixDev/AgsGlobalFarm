# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ags-mobile** is an Expo/React Native mobile application for agricultural job seekers and farm owners in Senegal. It provides job listings, training courses, and agricultural advice based on region/location.

## Tech Stack

- **Framework**: Expo SDK 54 with React Native 0.81.5
- **Routing**: expo-router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context API (UserContext, JobsContext, TrainingContext)
- **Storage**: AsyncStorage for data persistence
- **Maps**: Mapbox via @rnmapbox/maps
- **Validation**: Zod
- **Package Manager**: bun

## Commands

```bash
bun install          # Install dependencies
bun start            # Start development server
bun run android      # Run on Android
bun run ios          # Run on iOS
bun run web          # Run web build
bun run lint         # Lint code with ESLint
bun run format       # Format code with Prettier
bun run doctor       # Run Expo doctor
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

- `src/contexts/` - React Context providers:
  - `UserContext.tsx` - User authentication and profile
  - `JobsContext.tsx` - Job listings and applications
  - `TrainingContext.tsx` - Training courses and progress

- `src/data/` - Static/mock data (senegal-regions.ts, mockJobs.ts, training-courses.ts)

- `src/schemas/` - Zod validation schemas

- `src/types.d.ts` - TypeScript type definitions (all interfaces in one file)

## Architecture

The app uses a nested provider pattern in `src/app/_layout.tsx`:

```
UserProvider -> JobsProvider -> TrainingProvider -> Stack
```

Navigation uses React Navigation with bottom tabs. Path aliases: `@/*` maps to `src/*`.

## Key Patterns

- Context hooks follow naming convention: `useUser()`, `useJobs()`, `useTraining()`
- UI components are in `src/components/ui/`
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
