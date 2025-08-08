// API Types for Workout Manager

export interface CreateWorkoutRequest {
  name: string;
  description?: string;
  category: string;
  exercises: CreateExerciseData[];
}

export interface CreateExerciseData {
  name: string;
  reps?: number;
  sets?: number;
  duration?: string;
  notes?: string;
  order: number;
}

export interface UpdateWorkoutRequest {
  name?: string;
  description?: string;
  category?: string;
  exercises?: UpdateExerciseData[];
}

export interface UpdateExerciseData {
  id?: string; // If provided, update existing; if not, create new
  name?: string;
  reps?: number;
  sets?: number;
  duration?: string;
  notes?: string;
  order?: number;
  _action?: 'update' | 'create' | 'delete'; // Explicit action for clarity
}

export interface CompleteWorkoutRequest {
  notes?: string;
  duration?: number; // actual time taken in minutes
}

export interface WorkoutResponse {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  exerciseCount?: number;
  completionCount?: number;
  lastCompleted?: string | null;
  exercises?: ExerciseResponse[];
  completions?: WorkoutCompletionResponse[];
}

export interface ExerciseResponse {
  id: string;
  name: string;
  reps: number | null;
  sets: number | null;
  duration: string | null;
  notes: string | null;
  order: number;
}

export interface WorkoutCompletionResponse {
  id: string;
  completedAt: string;
  notes: string | null;
  duration: number | null;
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query parameter types
export interface WorkoutQueryParams {
  category?: string;
  search?: string;
  favorite?: string;
  page?: string;
  limit?: string;
}