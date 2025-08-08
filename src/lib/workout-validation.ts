// Workout-specific validation functions
import {
  validateRequired,
  validateString,
  validateNumber,
  validateArray,
  validateWorkoutCategory,
  sanitizeString,
  ValidationError,
} from './api-utils';
import type {
  CreateWorkoutRequest,
  CreateExerciseData,
  UpdateWorkoutRequest,
  UpdateExerciseData,
  CompleteWorkoutRequest,
} from '@/types/api';

export function validateCreateWorkout(data: any): CreateWorkoutRequest {
  const errors: string[] = [];

  // Validate name
  const nameError = validateRequired(data.name, 'name') || 
                   validateString(data.name, 'name', 1, 100);
  if (nameError) errors.push(nameError);

  // Validate description (optional)
  if (data.description !== undefined && data.description !== null) {
    const descriptionError = validateString(data.description, 'description', 0, 500);
    if (descriptionError) errors.push(descriptionError);
  }

  // Validate category
  const categoryError = validateRequired(data.category, 'category') ||
                       validateString(data.category, 'category') ||
                       validateWorkoutCategory(data.category);
  if (categoryError) errors.push(categoryError);

  // Validate exercises
  const exercisesError = validateRequired(data.exercises, 'exercises') ||
                        validateArray(data.exercises, 'exercises');
  if (exercisesError) {
    errors.push(exercisesError);
  } else if (data.exercises.length === 0) {
    errors.push('At least one exercise is required');
  } else {
    // Validate each exercise
    data.exercises.forEach((exercise: any, index: number) => {
      try {
        validateCreateExercise(exercise);
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(`Exercise ${index + 1}: ${error.message}`);
        }
      }
    });
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return {
    name: sanitizeString(data.name),
    description: data.description ? sanitizeString(data.description) : undefined,
    category: data.category.toLowerCase(),
    exercises: data.exercises.map((exercise: any, index: number) => ({
      ...validateCreateExercise(exercise),
      order: exercise.order ?? index,
    })),
  };
}

export function validateCreateExercise(data: any): CreateExerciseData {
  const errors: string[] = [];

  // Validate name
  const nameError = validateRequired(data.name, 'name') ||
                   validateString(data.name, 'name', 1, 100);
  if (nameError) errors.push(nameError);

  // Validate reps (optional)
  if (data.reps !== undefined && data.reps !== null) {
    const repsError = validateNumber(data.reps, 'reps', 1, 1000);
    if (repsError) errors.push(repsError);
  }

  // Validate sets (optional)
  if (data.sets !== undefined && data.sets !== null) {
    const setsError = validateNumber(data.sets, 'sets', 1, 100);
    if (setsError) errors.push(setsError);
  }

  // Validate duration (optional)
  if (data.duration !== undefined && data.duration !== null) {
    const durationError = validateString(data.duration, 'duration', 1, 50);
    if (durationError) errors.push(durationError);
  }

  // Validate notes (optional)
  if (data.notes !== undefined && data.notes !== null) {
    const notesError = validateString(data.notes, 'notes', 0, 500);
    if (notesError) errors.push(notesError);
  }

  // Validate order
  const orderError = validateRequired(data.order, 'order') ||
                    validateNumber(data.order, 'order', 0, 1000);
  if (orderError) errors.push(orderError);

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  return {
    name: sanitizeString(data.name),
    reps: data.reps ? parseInt(data.reps) : undefined,
    sets: data.sets ? parseInt(data.sets) : undefined,
    duration: data.duration ? sanitizeString(data.duration) : undefined,
    notes: data.notes ? sanitizeString(data.notes) : undefined,
    order: parseInt(data.order),
  };
}

export function validateUpdateWorkout(data: any): UpdateWorkoutRequest {
  const errors: string[] = [];

  // All fields are optional for updates, but if provided, they must be valid

  // Validate name (optional)
  if (data.name !== undefined) {
    const nameError = validateString(data.name, 'name', 1, 100);
    if (nameError) errors.push(nameError);
  }

  // Validate description (optional)
  if (data.description !== undefined) {
    const descriptionError = validateString(data.description, 'description', 0, 500);
    if (descriptionError) errors.push(descriptionError);
  }

  // Validate category (optional)
  if (data.category !== undefined) {
    const categoryError = validateString(data.category, 'category') ||
                         validateWorkoutCategory(data.category);
    if (categoryError) errors.push(categoryError);
  }

  // Validate exercises (optional)
  if (data.exercises !== undefined) {
    const exercisesError = validateArray(data.exercises, 'exercises');
    if (exercisesError) {
      errors.push(exercisesError);
    } else {
      // Validate each exercise
      data.exercises.forEach((exercise: any, index: number) => {
        try {
          validateUpdateExercise(exercise);
        } catch (error) {
          if (error instanceof ValidationError) {
            errors.push(`Exercise ${index + 1}: ${error.message}`);
          }
        }
      });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  const result: UpdateWorkoutRequest = {};

  if (data.name !== undefined) {
    result.name = sanitizeString(data.name);
  }
  if (data.description !== undefined) {
    result.description = data.description ? sanitizeString(data.description) : null;
  }
  if (data.category !== undefined) {
    result.category = data.category.toLowerCase();
  }
  if (data.exercises !== undefined) {
    result.exercises = data.exercises.map((exercise: any) => validateUpdateExercise(exercise));
  }

  return result;
}

export function validateUpdateExercise(data: any): UpdateExerciseData {
  const errors: string[] = [];

  // All fields are optional for updates

  // Validate id (optional, but if provided must be string)
  if (data.id !== undefined) {
    const idError = validateString(data.id, 'id');
    if (idError) errors.push(idError);
  }

  // Validate name (optional)
  if (data.name !== undefined) {
    const nameError = validateString(data.name, 'name', 1, 100);
    if (nameError) errors.push(nameError);
  }

  // Validate reps (optional)
  if (data.reps !== undefined && data.reps !== null) {
    const repsError = validateNumber(data.reps, 'reps', 1, 1000);
    if (repsError) errors.push(repsError);
  }

  // Validate sets (optional)
  if (data.sets !== undefined && data.sets !== null) {
    const setsError = validateNumber(data.sets, 'sets', 1, 100);
    if (setsError) errors.push(setsError);
  }

  // Validate duration (optional)
  if (data.duration !== undefined && data.duration !== null) {
    const durationError = validateString(data.duration, 'duration', 1, 50);
    if (durationError) errors.push(durationError);
  }

  // Validate notes (optional)
  if (data.notes !== undefined && data.notes !== null) {
    const notesError = validateString(data.notes, 'notes', 0, 500);
    if (notesError) errors.push(notesError);
  }

  // Validate order (optional)
  if (data.order !== undefined) {
    const orderError = validateNumber(data.order, 'order', 0, 1000);
    if (orderError) errors.push(orderError);
  }

  // Validate action (optional)
  if (data._action !== undefined) {
    if (!['update', 'create', 'delete'].includes(data._action)) {
      errors.push('_action must be one of: update, create, delete');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  const result: UpdateExerciseData = {};

  if (data.id !== undefined) result.id = data.id;
  if (data.name !== undefined) result.name = sanitizeString(data.name);
  if (data.reps !== undefined) result.reps = data.reps ? parseInt(data.reps) : null;
  if (data.sets !== undefined) result.sets = data.sets ? parseInt(data.sets) : null;
  if (data.duration !== undefined) result.duration = data.duration ? sanitizeString(data.duration) : null;
  if (data.notes !== undefined) result.notes = data.notes ? sanitizeString(data.notes) : null;
  if (data.order !== undefined) result.order = parseInt(data.order);
  if (data._action !== undefined) result._action = data._action;

  return result;
}

export function validateCompleteWorkout(data: any): CompleteWorkoutRequest {
  const errors: string[] = [];

  // Validate notes (optional)
  if (data.notes !== undefined && data.notes !== null) {
    const notesError = validateString(data.notes, 'notes', 0, 1000);
    if (notesError) errors.push(notesError);
  }

  // Validate duration (optional)
  if (data.duration !== undefined && data.duration !== null) {
    const durationError = validateNumber(data.duration, 'duration', 1, 600); // 1-600 minutes
    if (durationError) errors.push(durationError);
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  const result: CompleteWorkoutRequest = {};

  if (data.notes !== undefined && data.notes !== null) {
    result.notes = sanitizeString(data.notes);
  }
  if (data.duration !== undefined && data.duration !== null) {
    result.duration = parseInt(data.duration);
  }

  return result;
}