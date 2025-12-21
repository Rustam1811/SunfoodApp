# Coach/Admin Panel - Firestore Schema

This document describes the Firestore database schema for the coach/admin panel functionality.

## Multi-Tenant Structure

All data is scoped under a `tenantId` to support multi-tenant deployments.

```
tenants/{tenantId}/
├── clients/{clientId}
│   ├── plans/{date}          # Workout plans (date as YYYY-MM-DD)
│   ├── schedules/{weekStart} # Week schedules
│   ├── nutrition/targets     # Nutrition targets (single doc)
│   ├── water/target          # Water target (single doc)
│   └── notes/{noteId}        # Coach notes
└── exercises/{exerciseId}    # Tenant-specific exercises

exercises/{exerciseId}        # Global exercises (isGlobal: true)
```

## Collections & Documents

### 1. Clients Collection
**Path:** `tenants/{tenantId}/clients/{clientId}`

```typescript
interface Client {
  id: string;               // User ID (from Firebase Auth)
  phone: string;            // +77771234567
  name: string;             // Display name
  email?: string;           // Optional email
  tenantId: string;         // Tenant scope
  trainerId?: string;       // Assigned coach ID
  role: 'client' | 'coach' | 'admin';
  onboardingCompleted: boolean;
  height?: number;          // cm
  weight?: number;          // kg
  goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health';
  level?: 'beginner' | 'intermediate' | 'advanced';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2. Workout Plans Collection
**Path:** `tenants/{tenantId}/clients/{clientId}/plans/{date}`

Document ID is the date in `YYYY-MM-DD` format.

```typescript
interface WorkoutPlan {
  id: string;               // Same as date
  clientId: string;
  trainerId: string;
  tenantId: string;
  date: string;             // YYYY-MM-DD
  title: string;
  description?: string;
  exercises: PlannedExercise[];
  estimatedDuration: number; // minutes
  difficulty: 'easy' | 'moderate' | 'hard';
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface PlannedExercise {
  id: string;               // Unique within plan
  exerciseId: string;       // Reference to exercise library
  name: string;             // Cached name
  description?: string;
  coachVideoUrl?: string;   // Coach's demo video URL
  thumbnailUrl?: string;
  targetMuscles: string[];
  equipment?: string;
  sets: PlannedSet[];
  notes?: string;           // Coach notes for this exercise
  order: number;
}

interface PlannedSet {
  setNumber: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetWeight: number;     // kg
  restSeconds: number;
}
```

### 3. Week Schedules Collection
**Path:** `tenants/{tenantId}/clients/{clientId}/schedules/{weekStartDate}`

```typescript
interface WeekSchedule {
  id: string;               // Week start date YYYY-MM-DD (Monday)
  clientId: string;
  tenantId: string;
  weekStartDate: string;
  days: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface DaySchedule {
  isRestDay: boolean;
  planId?: string;          // Reference to plan date
  title?: string;
}
```

### 4. Nutrition Targets Document
**Path:** `tenants/{tenantId}/clients/{clientId}/nutrition/targets`

Single document per client.

```typescript
interface NutritionTargets {
  id: 'targets';
  clientId: string;
  coachId: string;
  tenantId: string;
  dailyMacros: {
    calories: number;       // kcal
    protein: number;        // grams
    carbs: number;          // grams
    fat: number;            // grams
  };
  mealDistribution: {
    breakfast: number;      // percentage (0-100)
    lunch: number;
    dinner: number;
    snacks: number;
  };
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5. Water Target Document
**Path:** `tenants/{tenantId}/clients/{clientId}/water/target`

```typescript
interface WaterTarget {
  id: 'target';
  clientId: string;
  coachId: string;
  tenantId: string;
  dailyLiters: number;      // Target liters/day
  cupSizeMl: number;        // Cup size in ml
  remindersEnabled: boolean;
  reminderIntervalMinutes?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 6. Coach Notes Collection
**Path:** `tenants/{tenantId}/clients/{clientId}/notes/{noteId}`

```typescript
interface CoachNote {
  id: string;
  clientId: string;
  coachId: string;
  tenantId: string;
  type: 'daily' | 'weekly' | 'workout' | 'nutrition' | 'general';
  date?: string;            // For daily notes (YYYY-MM-DD)
  weekStartDate?: string;   // For weekly notes
  title: string;
  content: string;
  isPrivate: boolean;       // If true, not visible to client
  priority: 'low' | 'normal' | 'high';
  attachments: Attachment[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Attachment {
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
}
```

### 7. Exercises Collection
**Global Path:** `exercises/{exerciseId}`
**Tenant Path:** `tenants/{tenantId}/exercises/{exerciseId}`

```typescript
interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  videoUrl?: string;        // Demo video URL (Storage)
  thumbnailUrl?: string;
  equipment: string[];
  muscleGroups: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  createdBy: string;        // Coach ID or 'system'
  isGlobal: boolean;        // If true, visible to all tenants
  tenantId?: string;        // Only for non-global exercises
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type ExerciseCategory = 
  | 'chest' | 'back' | 'shoulders' 
  | 'biceps' | 'triceps' 
  | 'legs' | 'glutes' | 'core' 
  | 'cardio' | 'stretching' 
  | 'compound' | 'functional';
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/tenants/default/clients/$(request.auth.uid)).data;
    }
    
    function isCoach() {
      return isSignedIn() && getUserData().role == 'coach';
    }
    
    function isAdmin() {
      return isSignedIn() && getUserData().role == 'admin';
    }
    
    function isCoachOrAdmin() {
      return isCoach() || isAdmin();
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAssignedCoach(clientId) {
      let client = get(/databases/$(database)/documents/tenants/default/clients/$(clientId)).data;
      return client.trainerId == request.auth.uid;
    }
    
    // Global exercises (read by all signed in, write by admin)
    match /exercises/{exerciseId} {
      allow read: if isSignedIn();
      allow create: if isCoachOrAdmin();
      allow update, delete: if isAdmin() || 
        (isCoach() && resource.data.createdBy == request.auth.uid);
    }
    
    // Tenant-scoped data
    match /tenants/{tenantId} {
      
      // Clients collection
      match /clients/{clientId} {
        // Client can read their own data
        allow read: if isOwner(clientId) || isCoachOrAdmin();
        
        // Coach can update their assigned clients
        allow update: if isAdmin() || isAssignedCoach(clientId);
        
        // Only admin can create/delete clients
        allow create, delete: if isAdmin();
        
        // Workout plans
        match /plans/{planId} {
          allow read: if isOwner(clientId) || isCoachOrAdmin();
          allow write: if isAdmin() || isAssignedCoach(clientId);
        }
        
        // Week schedules
        match /schedules/{scheduleId} {
          allow read: if isOwner(clientId) || isCoachOrAdmin();
          allow write: if isAdmin() || isAssignedCoach(clientId);
        }
        
        // Nutrition targets
        match /nutrition/{docId} {
          allow read: if isOwner(clientId) || isCoachOrAdmin();
          allow write: if isAdmin() || isAssignedCoach(clientId);
        }
        
        // Water target
        match /water/{docId} {
          allow read: if isOwner(clientId) || isCoachOrAdmin();
          allow write: if isAdmin() || isAssignedCoach(clientId);
        }
        
        // Coach notes
        match /notes/{noteId} {
          // Client can only read non-private notes
          allow read: if isCoachOrAdmin() || 
            (isOwner(clientId) && !resource.data.isPrivate);
          allow write: if isAdmin() || isAssignedCoach(clientId);
        }
      }
      
      // Tenant exercises
      match /exercises/{exerciseId} {
        allow read: if isSignedIn();
        allow create: if isCoachOrAdmin();
        allow update, delete: if isAdmin() || 
          (isCoach() && resource.data.createdBy == request.auth.uid);
      }
    }
  }
}
```

---

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Exercise videos
    match /exercises/{exerciseId}/{allPaths=**} {
      allow read: if isSignedIn();
      allow write: if isSignedIn(); // Could add role check
    }
    
    // Tenant exercise videos
    match /tenants/{tenantId}/exercises/{exerciseId}/{allPaths=**} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
    
    // Coach demo videos for client exercises
    match /tenants/{tenantId}/clients/{clientId}/coach-videos/{allPaths=**} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
    
    // Note attachments
    match /tenants/{tenantId}/clients/{clientId}/attachments/{allPaths=**} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
  }
}
```

---

## Indexes Required

Create these composite indexes in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "clients",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "trainerId", "order": "ASCENDING" },
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "clients",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "plans",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "notes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "exercises",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isGlobal", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "exercises",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "isGlobal", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## Usage Examples

### Get client's workout plan for today
```typescript
const today = new Date().toISOString().split('T')[0];
const plan = await getWorkoutPlan(clientId, today, tenantId);
```

### Create a new exercise
```typescript
await createExercise({
  name: 'Жим штанги лёжа',
  category: 'chest',
  description: 'Базовое упражнение для грудных мышц',
  muscleGroups: ['chest', 'triceps', 'shoulders'],
  equipment: ['barbell', 'bench'],
  difficulty: 'intermediate',
  isGlobal: false,
}, coachId, tenantId);
```

### Save nutrition targets
```typescript
await saveNutritionTargets({
  clientId,
  coachId,
  tenantId,
  dailyMacros: { calories: 2200, protein: 150, carbs: 220, fat: 70 },
  mealDistribution: { breakfast: 25, lunch: 35, dinner: 30, snacks: 10 },
  notes: 'Увеличить белок перед тренировками',
}, tenantId);
```

---

## Migration Notes

If migrating from an existing schema:

1. Create `tenants/default` document if multi-tenancy not needed
2. Move existing user profiles to `tenants/default/clients/{uid}`
3. Add `tenantId` field to all documents
4. Create composite indexes before deploying
5. Update security rules
