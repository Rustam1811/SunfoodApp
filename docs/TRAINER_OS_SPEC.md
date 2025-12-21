# Trainer OS - Technical Specification

## 1. Firestore Schema

### Collections

```
users/
  {userId}/
    role: 'client' | 'coach' | 'admin'
    phone: string
    name: string
    email?: string
    coachId?: string (for clients only)
    createdAt: timestamp
    lastLoginAt: timestamp
    onboardingCompleted: boolean
    settings: {
      showMacros: boolean (client preference)
      notifications: boolean
    }

coachClients/
  {coachId}/
    clients/
      {clientId}/
        clientId: string
        name: string
        status: 'active' | 'inactive' | 'paused'
        activityStatus: 'green' | 'yellow' | 'red'
        lastWorkoutAt: timestamp | null
        lastLoginAt: timestamp
        consecutiveSkipDays: number
        createdAt: timestamp

exercises/
  {exerciseId}/
    name: string
    category: string (e.g., 'chest', 'back', 'legs', 'cardio')
    description: string
    videoUrl?: string (coach demo video)
    thumbnailUrl?: string
    equipment?: string[]
    muscleGroups: string[]
    createdBy: string (coachId or 'system')
    isGlobal: boolean (admin-created = true)
    createdAt: timestamp

workoutTemplates/
  {templateId}/
    coachId: string
    name: string
    description?: string
    exercises: [
      {
        exerciseId: string
        exerciseName: string
        sets: number
        reps: string (e.g., '12' or '8-12')
        weight?: string
        restSeconds: number
        notes?: string
        videoUrl?: string
      }
    ]
    createdAt: timestamp
    updatedAt: timestamp

workoutSessions/
  {sessionId}/
    clientId: string
    coachId: string
    templateId?: string
    scheduledDate: timestamp (date only, no time)
    status: 'scheduled' | 'in_progress' | 'completed' | 'skipped'
    startedAt?: timestamp
    completedAt?: timestamp
    exercises: [
      {
        exerciseId: string
        exerciseName: string
        sets: [
          {
            setNumber: number
            targetReps: string
            targetWeight?: string
            actualReps?: number
            actualWeight?: number
            completed: boolean
            completedAt?: timestamp
          }
        ]
        restSeconds: number
        notes?: string
        coachVideoUrl?: string
        clientVideoUrl?: string
      }
    ]
    notes?: string
    heartRateAvg?: number
    caloriesBurned?: number

nutritionPlans/
  {planId}/
    clientId: string
    coachId: string
    weekStartDate: timestamp
    days: {
      monday: { breakfast: Meal, lunch: Meal, dinner: Meal, snacks?: Meal[] }
      tuesday: { ... }
      ...
    }
    macros: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
    createdAt: timestamp
    updatedAt: timestamp

// Meal type:
// { name: string, description?: string, ingredients?: string[], macros?: { cal, p, c, f } }

nutritionCheckmarks/
  {date_clientId}/  (e.g., '2025-12-20_abc123')
    clientId: string
    date: timestamp
    breakfast: boolean
    lunch: boolean
    dinner: boolean
    waterGlasses: number (0-12)
    snacks: boolean[]
    updatedAt: timestamp

bodyMetrics/
  {metricId}/
    clientId: string
    date: timestamp
    weight?: number (kg)
    measurements?: {
      chest?: number
      waist?: number
      hips?: number
      biceps?: number
      thighs?: number
    }
    bodyFat?: number (%)
    photos?: string[] (urls)
    notes?: string
    createdBy: 'client' | 'coach'

personalRecords/
  {recordId}/
    clientId: string
    exerciseId: string
    exerciseName: string
    weight: number
    reps: number
    date: timestamp
    previousRecord?: { weight: number, reps: number, date: timestamp }

healthNotes/
  {noteId}/
    clientId: string
    coachId: string
    type: 'injury' | 'limitation' | 'medical' | 'general'
    title: string
    content: string
    severity?: 'low' | 'medium' | 'high'
    activeUntil?: timestamp
    createdAt: timestamp
    updatedAt: timestamp

clientVideos/
  {videoId}/
    clientId: string
    coachId: string
    sessionId?: string
    exerciseId?: string
    videoUrl: string
    thumbnailUrl?: string
    duration: number (seconds)
    uploadedAt: timestamp
    status: 'processing' | 'ready' | 'failed'

videoComments/
  {commentId}/
    videoId: string
    coachId: string
    timecode: number (seconds into video)
    comment: string
    createdAt: timestamp

watchMetrics/
  {metricId}/
    clientId: string
    date: timestamp
    source: 'apple_health' | 'google_fit' | 'manual'
    heartRate: {
      avg: number
      max: number
      min: number
      resting?: number
    }
    calories: {
      active: number
      total: number
    }
    steps?: number
    activeMinutes?: number
    sleepHours?: number

signals/
  {signalId}/
    clientId: string
    coachId: string
    type: 'skip_workout' | 'high_heart_rate' | 'low_adherence' | 'no_login'
    severity: 'info' | 'warning' | 'alert'
    message: string
    data?: object
    acknowledged: boolean
    acknowledgedAt?: timestamp
    createdAt: timestamp

weeklySummaries/
  {summaryId}/  (clientId_weekStart)
    clientId: string
    coachId: string
    weekStartDate: timestamp
    status: 'green' | 'yellow' | 'red'
    workoutsPlanned: number
    workoutsCompleted: number
    nutritionAdherence: number (%)
    waterAverage: number
    signals: string[] (signal IDs)
    notes?: string
    createdAt: timestamp

coachMessages/
  {messageId}/
    clientId: string
    coachId: string
    type: 'instruction' | 'feedback' | 'video_comment'
    content: string
    pinned: boolean
    videoId?: string
    timecode?: number
    read: boolean
    createdAt: timestamp
```

## 2. Route Map

### Client Routes (/app/*)
```
/app/                    → Redirect based on role
/app/login               → Phone + password login
/app/today               → Today screen (4 states)
/app/workout/:sessionId  → Workout execution
/app/nutrition           → Nutrition today/week
/app/body                → Body metrics & records (swipe access)
/app/coach               → Coach messages & instructions
```

### Coach Routes (/app/coach/*)
```
/app/coach/clients                    → Client cards list
/app/coach/clients/:clientId          → Client profile (tabs)
/app/coach/clients/:clientId/body     → Body tab
/app/coach/clients/:clientId/workouts → Workouts tab
/app/coach/clients/:clientId/nutrition→ Nutrition tab
/app/coach/clients/:clientId/videos   → Videos tab
/app/coach/workout-builder            → Workout wizard
/app/coach/workout-builder/:templateId→ Edit template
/app/coach/exercises                  → Exercise base
/app/coach/signals                    → Alerts & signals
```

### Admin Routes (/app/admin/*)
```
/app/admin/coaches        → Manage coaches
/app/admin/exercises      → Global exercise base
/app/admin/settings       → Platform settings
/app/admin/tariffs        → Tariffs placeholder (future)
```

## 3. Navigation Model

### Client Bottom Bar (3 items only)
- Today (home icon)
- Nutrition (utensils icon)
- Coach (message icon)

Body is accessible via:
- Swipe right from Today
- Or profile avatar tap (minimal)

### Coach Bottom Bar (4 items)
- Clients (users icon)
- Exercises (dumbbell icon)
- Signals (bell icon)
- Profile (user icon)

### Admin Bottom Bar (4 items)
- Coaches (users icon)
- Exercises (dumbbell icon)
- Settings (cog icon)
- Profile (user icon)

## 4. Client "Today" Screen States

### State 1: Rest Day
- Large "Rest Day" message
- Optional coach message
- Tomorrow's preview (minimal)
- Subtle "Record video" button

### State 2: Workout Scheduled
- Workout name
- Exercise count
- Estimated duration
- Big "Start Workout" button

### State 3: Workout In Progress
- Current exercise with video
- Sets list (tap to complete)
- Rest timer (auto-starts)
- Heart rate (if connected)
- Progress bar

### State 4: Workout Completed
- Completion summary
- Duration, exercises, sets
- "Great job" message
- Optional "Record video" button

## 5. Security Rules Principles

1. Client can only read/write own data
2. Coach can read/write data for their clients only
3. Admin can read/write all data
4. Exercise base: global exercises readable by all, writable by admin
5. Coach-created exercises: readable by coach's clients

## 6. Done / Deferred List

### v1 DONE (Must implement)
- [x] Firestore schema
- [x] Route map
- [x] Security rules
- [ ] Client Today (4 states)
- [ ] Exercise execution + video record
- [ ] Coach Clients + Client profile tabs
- [ ] Workout Builder Wizard
- [ ] Nutrition today/week + water
- [ ] Videos with timecodes
- [ ] Smart logic signals
- [ ] Weekly summary
- [ ] Watch metrics UI (contract + display)
- [ ] Platform Admin placeholders

### DEFERRED (Out of scope for v1)
- Payments/tariffs implementation (placeholder only)
- Google Fit integration (placeholder)
- Native iOS/Android widgets (web preview only)
- Voice messages
- Chat functionality
- Achievement system
- Streak counters
- Motivational quotes
