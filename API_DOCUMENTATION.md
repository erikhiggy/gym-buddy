# Workout Manager API Documentation

This document describes the REST API endpoints for the Workout Manager application.

## Base URL
All API endpoints are prefixed with `/api`

## Authentication
Currently, no authentication is required (this can be added later).

## Error Handling
All endpoints return consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "details": {} // Optional additional error details
}
```

### HTTP Status Codes
- `200` - OK (successful GET, PUT, PATCH)
- `201` - Created (successful POST)
- `204` - No Content (successful DELETE)
- `400` - Bad Request (validation errors)
- `404` - Not Found (resource doesn't exist)
- `422` - Unprocessable Entity (validation errors)
- `500` - Internal Server Error

## Endpoints

### 1. Get All Workouts
**GET** `/api/workouts`

Fetch all workouts with optional filtering and pagination.

#### Query Parameters
- `category` (string, optional) - Filter by workout category
- `search` (string, optional) - Search in workout name and description
- `favorite` (boolean, optional) - Filter by favorite status ("true" or "false")
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)

#### Response
```json
{
  "data": [
    {
      "id": "workout_id",
      "name": "Push Day Workout",
      "description": "Upper body push workout",
      "category": "strength",
      "isFavorite": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "exerciseCount": 4,
      "completionCount": 2,
      "lastCompleted": "2023-01-01T00:00:00.000Z",
      "exercises": [
        {
          "id": "exercise_id",
          "name": "Bench Press",
          "reps": 8,
          "sets": 4,
          "duration": null,
          "notes": "Focus on form",
          "order": 1
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### 2. Create Workout
**POST** `/api/workouts`

Create a new workout with exercises.

#### Request Body
```json
{
  "name": "Push Day Workout",
  "description": "Upper body push workout", // Optional
  "category": "strength", // Required: "strength", "cardio", "flexibility", "sports", "other"
  "exercises": [
    {
      "name": "Bench Press",
      "reps": 8, // Optional
      "sets": 4, // Optional
      "duration": "30 seconds", // Optional
      "notes": "Focus on form", // Optional
      "order": 1 // Required
    }
  ]
}
```

#### Validation Rules
- `name`: Required, 1-100 characters
- `description`: Optional, max 500 characters
- `category`: Required, must be valid category
- `exercises`: Required array, at least 1 exercise
- `exercises[].name`: Required, 1-100 characters
- `exercises[].reps`: Optional, 1-1000
- `exercises[].sets`: Optional, 1-100
- `exercises[].duration`: Optional, 1-50 characters
- `exercises[].notes`: Optional, max 500 characters
- `exercises[].order`: Required, 0-1000

#### Response
Returns the created workout with all exercises (201 Created).

### 3. Get Single Workout
**GET** `/api/workouts/{id}`

Fetch a single workout with all exercises and completion history.

#### Response
```json
{
  "id": "workout_id",
  "name": "Push Day Workout",
  "description": "Upper body push workout",
  "category": "strength",
  "isFavorite": false,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "exerciseCount": 4,
  "completionCount": 2,
  "lastCompleted": "2023-01-01T00:00:00.000Z",
  "exercises": [...],
  "completions": [
    {
      "id": "completion_id",
      "completedAt": "2023-01-01T00:00:00.000Z",
      "notes": "Great workout!",
      "duration": 45
    }
  ]
}
```

### 4. Update Workout
**PUT** `/api/workouts/{id}`

Update a workout and its exercises. Supports partial updates.

#### Request Body
```json
{
  "name": "Updated Workout Name", // Optional
  "description": "Updated description", // Optional
  "category": "cardio", // Optional
  "exercises": [ // Optional - array of exercise updates
    {
      "id": "existing_exercise_id", // Include ID to update existing
      "name": "Updated Exercise Name",
      "reps": 10,
      "_action": "update" // Optional: "update", "create", "delete"
    },
    {
      // No ID = create new exercise
      "name": "New Exercise",
      "sets": 3,
      "order": 5,
      "_action": "create"
    },
    {
      "id": "exercise_to_delete",
      "_action": "delete"
    }
  ]
}
```

#### Exercise Update Behavior
- **With ID + no action**: Update existing exercise
- **With ID + "update"**: Update existing exercise
- **With ID + "delete"**: Delete existing exercise
- **No ID or "create"**: Create new exercise
- **Complete replacement**: Send full exercises array without IDs

#### Response
Returns the updated workout with all current exercises (200 OK).

### 5. Delete Workout
**DELETE** `/api/workouts/{id}`

Delete a workout and all associated exercises and completions.

#### Response
```json
{
  "message": "Workout deleted successfully"
}
```
Status: 204 No Content

### 6. Toggle Favorite
**PATCH** `/api/workouts/{id}/favorite`

Toggle the favorite status of a workout.

#### Response
Returns the updated workout with new favorite status (200 OK).

### 7. Complete Workout
**POST** `/api/workouts/{id}/complete`

Mark a workout as completed with optional notes and duration.

#### Request Body
```json
{
  "notes": "Great workout today!", // Optional, max 1000 characters
  "duration": 45 // Optional, actual time in minutes (1-600)
}
```

#### Response
```json
{
  "message": "Workout completed successfully",
  "completion": {
    "id": "completion_id",
    "completedAt": "2023-01-01T00:00:00.000Z",
    "notes": "Great workout today!",
    "duration": 45
  }
}
```
Status: 201 Created

## Data Models

### Workout
```typescript
interface Workout {
  id: string;
  name: string;
  description: string | null;
  category: string; // "strength" | "cardio" | "flexibility" | "sports" | "other"
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Exercise
```typescript
interface Exercise {
  id: string;
  name: string;
  reps: number | null;
  sets: number | null;
  duration: string | null; // e.g., "30 seconds", "2 minutes"
  notes: string | null;
  workoutId: string;
  order: number;
}
```

### Workout Completion
```typescript
interface WorkoutCompletion {
  id: string;
  workoutId: string;
  completedAt: Date;
  notes: string | null;
  duration: number | null; // actual time taken in minutes
}
```

## Usage Examples

### JavaScript/TypeScript Client
```typescript
// Using the provided API client
import { workoutApi } from '@/lib/api-client';

// Get all strength workouts
const strengthWorkouts = await workoutApi.getWorkouts({ 
  category: 'strength' 
});

// Create a new workout
const newWorkout = await workoutApi.createWorkout({
  name: 'My Workout',
  category: 'strength',
  exercises: [
    {
      name: 'Push-ups',
      sets: 3,
      reps: 15,
      order: 1
    }
  ]
});

// Complete a workout
await workoutApi.completeWorkout('workout-id', {
  notes: 'Felt great!',
  duration: 30
});
```

### cURL Examples

#### Get workouts
```bash
curl -X GET "http://localhost:3000/api/workouts?category=strength&limit=10"
```

#### Create workout
```bash
curl -X POST "http://localhost:3000/api/workouts" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workout",
    "category": "strength",
    "exercises": [
      {
        "name": "Push-ups",
        "sets": 3,
        "reps": 15,
        "order": 1
      }
    ]
  }'
```

#### Complete workout
```bash
curl -X POST "http://localhost:3000/api/workouts/WORKOUT_ID/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Great workout!",
    "duration": 45
  }'
```

## Database Schema
The API uses the following Prisma schema:

```prisma
model Workout {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String
  isFavorite  Boolean  @default(false)
  exercises   Exercise[]
  completions WorkoutCompletion[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Exercise {
  id          String  @id @default(cuid())
  name        String
  reps        Int?
  sets        Int?
  duration    String?
  notes       String?
  workoutId   String
  workout     Workout @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  order       Int     @default(0)
}

model WorkoutCompletion {
  id          String   @id @default(cuid())
  workoutId   String
  workout     Workout  @relation(fields: [workoutId], references: [id])
  completedAt DateTime @default(now())
  notes       String?
  duration    Int?
}
```

## Development Notes

### Transaction Safety
- Workout creation and exercise creation are wrapped in a database transaction
- Workout updates with exercise modifications use transactions to ensure data consistency
- Failed operations are rolled back completely

### Performance Considerations
- Pagination is implemented for workout listing (max 100 items per page)
- Database queries are optimized with proper includes and ordering
- Exercise ordering is handled at the database level

### Security Features
- All inputs are validated and sanitized
- SQL injection protection via Prisma ORM
- Comprehensive error handling without exposing sensitive data

### Future Enhancements
- Authentication and authorization
- User-specific workouts
- Workout templates and sharing
- Exercise library with muscle group targeting
- Progress tracking and analytics