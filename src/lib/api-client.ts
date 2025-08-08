// API Client utility for consuming workout manager APIs
import type {
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  CompleteWorkoutRequest,
  WorkoutResponse,
  WorkoutCompletionResponse,
  WorkoutQueryParams,
  PaginatedResponse,
} from '@/types/api';

class WorkoutApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle no content responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Fetch all workouts with optional filtering
   * GET /api/workouts
   */
  async getWorkouts(params?: WorkoutQueryParams): Promise<PaginatedResponse<WorkoutResponse>> {
    const queryString = params ? new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    ).toString() : '';

    const endpoint = `/workouts${queryString ? `?${queryString}` : ''}`;
    return this.fetchApi<PaginatedResponse<WorkoutResponse>>(endpoint);
  }

  /**
   * Create a new workout with exercises
   * POST /api/workouts
   */
  async createWorkout(workout: CreateWorkoutRequest): Promise<WorkoutResponse> {
    return this.fetchApi<WorkoutResponse>('/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
    });
  }

  /**
   * Fetch a single workout by ID
   * GET /api/workouts/[id]
   */
  async getWorkout(id: string): Promise<WorkoutResponse> {
    return this.fetchApi<WorkoutResponse>(`/workouts/${id}`);
  }

  /**
   * Update a workout
   * PUT /api/workouts/[id]
   */
  async updateWorkout(id: string, workout: UpdateWorkoutRequest): Promise<WorkoutResponse> {
    return this.fetchApi<WorkoutResponse>(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workout),
    });
  }

  /**
   * Delete a workout
   * DELETE /api/workouts/[id]
   */
  async deleteWorkout(id: string): Promise<void> {
    return this.fetchApi<void>(`/workouts/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Toggle favorite status of a workout
   * PATCH /api/workouts/[id]/favorite
   */
  async toggleFavorite(id: string): Promise<WorkoutResponse> {
    return this.fetchApi<WorkoutResponse>(`/workouts/${id}/favorite`, {
      method: 'PATCH',
    });
  }

  /**
   * Mark a workout as completed
   * POST /api/workouts/[id]/complete
   */
  async completeWorkout(
    id: string, 
    completion: CompleteWorkoutRequest = {}
  ): Promise<{ message: string; completion: WorkoutCompletionResponse }> {
    return this.fetchApi<{ message: string; completion: WorkoutCompletionResponse }>(
      `/workouts/${id}/complete`,
      {
        method: 'POST',
        body: JSON.stringify(completion),
      }
    );
  }
}

// Export a default instance
export const workoutApi = new WorkoutApiClient();

// Export the class for custom instances
export { WorkoutApiClient };

// Convenience hooks for React components
export function useWorkoutApi() {
  return workoutApi;
}

// Example usage functions
export const WorkoutApiExamples = {
  /**
   * Example: Create a complete workout with exercises
   */
  async createSampleWorkout() {
    const workout: CreateWorkoutRequest = {
      name: 'Push Day Workout',
      description: 'Upper body push muscles - chest, shoulders, triceps',
      category: 'strength',
      exercises: [
        {
          name: 'Bench Press',
          sets: 4,
          reps: 8,
          order: 1,
          notes: 'Focus on controlled movement',
        },
        {
          name: 'Overhead Press',
          sets: 3,
          reps: 10,
          order: 2,
        },
        {
          name: 'Push-ups',
          sets: 3,
          reps: 15,
          order: 3,
        },
        {
          name: 'Tricep Dips',
          sets: 3,
          reps: 12,
          order: 4,
        },
      ],
    };

    return workoutApi.createWorkout(workout);
  },

  /**
   * Example: Search for cardio workouts
   */
  async findCardioWorkouts() {
    return workoutApi.getWorkouts({
      category: 'cardio',
      limit: '10',
    });
  },

  /**
   * Example: Update workout with new exercises
   */
  async updateWorkoutWithNewExercise(workoutId: string) {
    const update: UpdateWorkoutRequest = {
      exercises: [
        {
          name: 'New Exercise',
          sets: 3,
          reps: 10,
          order: 5,
          _action: 'create',
        },
      ],
    };

    return workoutApi.updateWorkout(workoutId, update);
  },

  /**
   * Example: Complete a workout with notes
   */
  async completeWorkoutWithFeedback(workoutId: string) {
    const completion: CompleteWorkoutRequest = {
      notes: 'Great workout today! Felt strong on bench press.',
      duration: 45, // 45 minutes
    };

    return workoutApi.completeWorkout(workoutId, completion);
  },
};