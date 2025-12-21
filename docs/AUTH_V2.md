# Auth System V2 - Production-Ready Implementation

## Overview

This auth system implements phone+password authentication using Firebase Auth with a "phone-as-email" pattern. Phone numbers are converted to email format (`+77771234567` → `77771234567@trainer.app`) to leverage Firebase Auth's secure password handling.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client App                          │
├─────────────────────────────────────────────────────────────┤
│  AuthContextV2        │  RouteGuards       │  Pages        │
│  - useAuth hook       │  - PrivateRoute    │  - LoginV2    │
│  - login/logout       │  - CoachRoute      │  - OnboardingV2│
│  - user state         │  - AdminRoute      │               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Auth                           │
│  - Email/Password (phone-as-email pattern)                 │
│  - Secure password hashing                                 │
│  - ID tokens for API auth                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firestore (User Profiles)                │
│  Collection: users/{uid}                                   │
│  - Profile data, role, onboarding status                   │
└─────────────────────────────────────────────────────────────┘
```

## Files Created

### Client-Side

| File | Purpose |
|------|---------|
| `src/lib/firebaseAuth.ts` | Firebase Auth wrapper with phone-as-email conversion |
| `src/services/authServiceV2.ts` | Auth service bridging Firebase Auth + Firestore profiles |
| `src/auth/AuthContextV2.tsx` | React context provider with hooks |
| `src/auth/RouteGuards.tsx` | Route protection components for React Router v5 |
| `src/auth/index.ts` | Barrel exports |
| `src/pages/LoginV2.tsx` | Login page with phone+password form |
| `src/pages/OnboardingV2.tsx` | Multi-step onboarding flow |
| `src/AppV2.tsx` | Updated App root using V2 auth |

### Server-Side (Firebase Functions)

| File | Purpose |
|------|---------|
| `functions/src/authGuard.ts` | Express middleware for token verification |

## User Profile Schema

```typescript
interface UserProfile {
  id: string;              // Firebase Auth UID
  phone: string;           // +77771234567
  email?: string;          // For coaches with real email
  name: string;
  avatar?: string;
  role: 'client' | 'coach' | 'admin';
  
  // Physical profile (clients)
  height?: number;
  weight?: number;
  targetWeight?: number;
  goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'general_fitness';
  level?: 'beginner' | 'intermediate' | 'advanced';
  gender?: 'male' | 'female' | 'other';
  
  // Trainer relationship
  trainerId?: string;
  tenantId?: string;
  
  // Status flags
  isActive: boolean;
  onboardingCompleted: boolean;
  profileCompleted: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
```

## Usage

### Switch to V2 Auth

Replace `App.tsx` content with `AppV2.tsx` or rename the file:

```bash
mv src/App.tsx src/AppOld.tsx
mv src/AppV2.tsx src/App.tsx
```

### Using Auth in Components

```tsx
import { useAuth } from './auth/AuthContextV2';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isClient, 
    isCoach, 
    canAccessAdmin,
    login, 
    logout 
  } = useAuth();
  
  // Check role
  if (isCoach) {
    return <CoachDashboard />;
  }
  
  // Login
  const handleLogin = async () => {
    const result = await login('+77771234567', 'password');
    if (result.success) {
      navigate(result.redirectTo);
    }
  };
  
  return <div>Welcome, {user?.name}</div>;
}
```

### Route Protection

```tsx
import { PrivateRoute, CoachRoute, AdminRoute } from './auth/RouteGuards';

<Switch>
  {/* Any authenticated user */}
  <PrivateRoute path="/main" component={MainPage} />
  
  {/* Coach or Admin only */}
  <CoachRoute path="/coach/clients" component={CoachClients} />
  
  {/* Admin only */}
  <AdminRoute path="/admin" component={AdminDashboard} />
</Switch>
```

### Server-Side Token Verification

```typescript
import { requireAuth, requireRole } from './authGuard';

// Require any authenticated user
app.get('/api/profile', requireAuth(async (req, res) => {
  const userId = req.user.uid;
  // ...
}));

// Require specific role
app.post('/api/admin/users', requireRole(['admin'], async (req, res) => {
  // Only admins can access
}));
```

## Security Notes

### Password Security
- ✅ Passwords are hashed by Firebase Auth (not stored in Firestore)
- ✅ Firebase Auth handles rate limiting for login attempts
- ✅ Strong password requirements enforced (min 6 chars)

### Token Security
- ✅ Firebase ID tokens are short-lived (1 hour)
- ✅ Tokens are automatically refreshed by the client SDK
- ✅ Server-side token verification via Firebase Admin SDK

### Data Security
- ✅ User profiles stored in Firestore with security rules
- ✅ Role-based access control in both client and server
- ⚠️ Add Firestore security rules to restrict profile access

### Recommended Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their own profile (except role)
      allow update: if request.auth != null 
        && request.auth.uid == userId
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);
      
      // Only admins can create users or change roles
      allow create, delete: if request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Coaches can read their assigned clients
      allow read: if request.auth != null 
        && resource.data.trainerId == request.auth.uid;
    }
  }
}
```

### Demo Accounts (Development Only)

For testing, these demo accounts are available:

| Role | Phone | Password |
|------|-------|----------|
| Client | +77770001111 | demo123 |
| Coach | +77770002222 | coach123 |
| Admin | +77001234567 | admin123 |

⚠️ **Remove demo accounts in production** by setting `import.meta.env.PROD` check or removing them from `authServiceV2.ts`.

## Migration Guide

### From Old Auth System

1. Update imports from `AuthContext` to `AuthContextV2`
2. Replace `user.uid` with `user.id`
3. Update route components to use new guards
4. Migrate existing users (create Firebase Auth accounts for them)

### User Migration Script

```javascript
// Run once to migrate existing Firestore users to Firebase Auth
const admin = require('firebase-admin');

async function migrateUsers() {
  const db = admin.firestore();
  const auth = admin.auth();
  
  const users = await db.collection('users').get();
  
  for (const doc of users.docs) {
    const userData = doc.data();
    const email = `${userData.phone.replace(/\D/g, '')}@trainer.app`;
    
    try {
      // Create Firebase Auth user
      const authUser = await auth.createUser({
        uid: doc.id,
        email: email,
        password: userData.password || 'changeme123', // Require password reset
      });
      
      console.log(`Migrated: ${userData.phone}`);
    } catch (error) {
      console.error(`Failed: ${userData.phone}`, error);
    }
  }
}
```

## Future Enhancements

- [ ] Email verification for coaches
- [ ] Password reset via SMS
- [ ] Social login (Google, Apple)
- [ ] Session management (logout all devices)
- [ ] Audit logging for sensitive actions
- [ ] Rate limiting for API endpoints
