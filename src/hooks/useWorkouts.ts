// React hooks for workout API operations
import { useState, useEffect, useCallback, useMemo } from 'react';
import { workoutApi } from '@/lib/api-client';
import type {
  WorkoutResponse,
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  CompleteWorkoutRequest,
  WorkoutQueryParams,
  PaginatedResponse,
} from '@/types/api';

// Types for hook states
interface UseWorkoutsState {
  workouts: WorkoutResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

interface UseWorkoutState {
  workout: WorkoutResponse | null;
  loading: boolean;
  error: string | null;
}

// Main hook for fetching and managing workouts list
export function useWorkouts(initialParams?: WorkoutQueryParams) {
  const [state, setState] = useState<UseWorkoutsState>({
    workouts: [],
    loading: true,
    error: null,
    pagination: null,
  });

  const [params, setParams] = useState<WorkoutQueryParams>(initialParams || {});

  const fetchWorkouts = useCallback(async (queryParams?: WorkoutQueryParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await workoutApi.getWorkouts(queryParams || params);
      setState({
        workouts: response.data,
        loading: false,
        error: null,
        pagination: response.pagination,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workouts',
      }));
    }
  }, [params]);

  const refresh = useCallback(() => {
    fetchWorkouts(params);
  }, [fetchWorkouts, params]);

  const updateParams = useCallback((newParams: Partial<WorkoutQueryParams>) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    fetchWorkouts(updatedParams);
  }, [params, fetchWorkouts]);

  // Fetch workouts when params change
  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // Computed values
  const favoriteWorkouts = useMemo(() => 
    state.workouts.filter(workout => workout.isFavorite),
    [state.workouts]
  );

  const workoutsByCategory = useMemo(() => {
    const categories: Record<string, WorkoutResponse[]> = {};
    state.workouts.forEach(workout => {
      if (!categories[workout.category]) {
        categories[workout.category] = [];
      }
      categories[workout.category].push(workout);
    });
    return categories;
  }, [state.workouts]);

  return {
    ...state,
    params,
    refresh,
    updateParams,
    favoriteWorkouts,
    workoutsByCategory,
  };
}

// Hook for managing a single workout
export function useWorkout(workoutId: string | null) {
  const [state, setState] = useState<UseWorkoutState>({
    workout: null,
    loading: false,
    error: null,
  });

  const fetchWorkout = useCallback(async (id: string) => {
    setState({ workout: null, loading: true, error: null });
    
    try {
      const workout = await workoutApi.getWorkout(id);
      setState({ workout, loading: false, error: null });
    } catch (error) {
      setState({
        workout: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workout',
      });
    }
  }, []);

  useEffect(() => {
    if (workoutId) {
      fetchWorkout(workoutId);
    }
  }, [workoutId, fetchWorkout]);

  const refresh = useCallback(() => {
    if (workoutId) {
      fetchWorkout(workoutId);
    }
  }, [workoutId, fetchWorkout]);

  return {
    ...state,
    refresh,
  };
}

// Hook for workout mutations (create, update, delete)
export function useWorkoutMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorkout = useCallback(async (workout: CreateWorkoutRequest): Promise<WorkoutResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await workoutApi.createWorkout(workout);
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create workout';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  const updateWorkout = useCallback(async (id: string, workout: UpdateWorkoutRequest): Promise<WorkoutResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await workoutApi.updateWorkout(id, workout);
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update workout';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  const deleteWorkout = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await workoutApi.deleteWorkout(id);
      setLoading(false);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete workout';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string): Promise<WorkoutResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await workoutApi.toggleFavorite(id);
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle favorite';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  const completeWorkout = useCallback(async (
    id: string, 
    completion?: CompleteWorkoutRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await workoutApi.completeWorkout(id, completion);
      setLoading(false);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete workout';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, []);

  return {
    loading,
    error,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    toggleFavorite,
    completeWorkout,
  };
}

// Hook for workout statistics and analytics
export function useWorkoutStats() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    favoriteWorkouts: 0,
    totalCompletions: 0,
    categoryCounts: {} as Record<string, number>,
    recentActivity: [] as WorkoutResponse[],
    loading: true,
  });

  const fetchStats = useCallback(async () => {
    try {
      // Fetch all workouts to calculate stats
      const response = await workoutApi.getWorkouts({ limit: '1000' }); // Large limit to get all
      const workouts = response.data;

      const totalWorkouts = workouts.length;
      const favoriteWorkouts = workouts.filter(w => w.isFavorite).length;
      const totalCompletions = workouts.reduce((sum, w) => sum + (w.completionCount || 0), 0);
      
      const categoryCounts: Record<string, number> = {};
      workouts.forEach(workout => {
        categoryCounts[workout.category] = (categoryCounts[workout.category] || 0) + 1;
      });

      // Get recent activity (workouts with recent completions)
      const recentActivity = workouts
        .filter(w => w.lastCompleted)
        .sort((a, b) => 
          new Date(b.lastCompleted!).getTime() - new Date(a.lastCompleted!).getTime()
        )
        .slice(0, 10);

      setStats({
        totalWorkouts,
        favoriteWorkouts,
        totalCompletions,
        categoryCounts,
        recentActivity,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch workout stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...stats,
    refresh: fetchStats,
  };
}

// Hook for search functionality
export function useWorkoutSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<WorkoutResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await workoutApi.getWorkouts({ search: searchQuery });
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      setLoading(false);
      setResults([]);
    }
  }, []);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    search(newQuery);
  }, [search]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    results,
    loading,
    error,
    updateQuery,
    clearSearch,
    search,
  };
}

// Example usage in a React component:
export const WorkoutHookExamples = {
  // Example: Basic workout list component
  WorkoutList: `
    function WorkoutList() {
      const { workouts, loading, error, refresh } = useWorkouts({ 
        limit: '10' 
      });
      
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error: {error}</div>;
      
      return (
        <div>
          <button onClick={refresh}>Refresh</button>
          {workouts.map(workout => (
            <div key={workout.id}>
              <h3>{workout.name}</h3>
              <p>{workout.description}</p>
            </div>
          ))}
        </div>
      );
    }
  `,

  // Example: Workout creation form
  WorkoutForm: `
    function WorkoutForm() {
      const { createWorkout, loading, error } = useWorkoutMutations();
      
      const handleSubmit = async (formData: CreateWorkoutRequest) => {
        const result = await createWorkout(formData);
        if (result) {
          // Handle success
          console.log('Workout created:', result);
        }
      };
      
      // Form implementation...
    }
  `,
};