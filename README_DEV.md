# Trainer OS v1 - Development Guide

## Quick Start

### 1. Start Development Servers

```bash
# Start all (API + Web + Admin)
npm run dev:local

# Or individually:
npm run dev        # Web app (port 5173)
npm run dev:api    # API server (port 3001)
cd admin && npm run dev  # Admin (port 5174)
```

### 2. Seed Demo Data

Populate Firestore with realistic demo data for UI visualization:

```bash
node scripts/seed-dev.js
```

This creates:
- **Coach user**: `demo-coach-001`
- **Client user**: `demo-client-001` (linked to coach)
- **7 days of workouts**: 4-6 exercises each with sets/reps
- **7 days of nutrition plans**: meals + macros + water target

The script is **idempotent** - re-running updates the same documents.

### 3. Login as Demo Users

After seeding, you need Firebase Auth users linked to the demo IDs.

**Option A**: Create auth users manually in Firebase Console with matching UIDs.

**Option B**: Update the seed script to also create auth users (requires admin SDK auth).

---

## Project Structure (Trainer OS v1)

### Client App (`/app`)

| Route | Page | Description |
|-------|------|-------------|
| `/today` | ClientToday | Today's workout + navigation |
| `/nutrition` | Nutrition | Daily meal plan with checkboxes |
| `/coach` | Coach | Coach info and contact |
| `/workout/:id` | WorkoutExecution | Exercise execution with timer |
| `/onboarding` | Onboarding | Initial profile setup |

### Coach App (`/app/coach`)

| Route | Page | Description |
|-------|------|-------------|
| `/coach/clients` | CoachClients | Client list with status |
| `/coach/clients/:id` | CoachClientDetail | Client detail with tabs |

### Admin (`/admin`)

Separate build, manages all backend data.

---

## Firestore Schema

```
users/
  {userId}/
    uid, email, displayName, role, coachId (for clients)

plans/
  {clientId}/
    workouts/
      {YYYY-MM-DD}/
        name, exercises[], status, completedAt
    nutrition/
      {YYYY-MM-DD}/
        meals{}, macros{}, waterTarget, waterCount, clientChecks{}
```

---

## Theme: Graphite + Wine

All NEW pages use CSS token classes:

```css
/* Backgrounds */
bg-tr-base       /* #1a1a1a - main background */
bg-tr-elevated   /* #252525 - raised surfaces */
bg-tr-card       /* #2a2a2a - cards */

/* Accent (wine/burgundy) */
bg-tr-accent     /* #722F37 - buttons, highlights */
text-tr-accent   /* #722F37 - accent text */

/* Text hierarchy */
text-tr-text         /* #ffffff - primary */
text-tr-text-secondary  /* #aaaaaa */
text-tr-text-muted      /* #888888 */

/* Borders */
border-tr-border  /* #333333 */
```

---

## Legacy Pages (Disabled)

Located in `src/legacy/`, not routed:
- Profile, CoachPrograms, Home, Favorites, ProgressTracking, etc.

All legacy routes redirect to `/today` (client) or `/coach/clients` (coach).

---

## Build

```bash
npm run build        # All builds
npm run build:web    # Web app only
npm run build:admin  # Admin only
```

---

## Troubleshooting

### Vite Cache Issues
```bash
rm -rf node_modules/.vite
npm run dev
```

### Firebase Auth Issues
Ensure service account exists at `functions/service-account.json`

### Port Conflicts
Default ports: 5173 (web), 5174 (admin), 3001 (API)
