// GET /api/workouts/[id] - Fetch single workout with exercises
// PUT /api/workouts/[id] - Update workout and exercises
// DELETE /api/workouts/[id] - Delete workout

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateJsonBody,
  HTTP_STATUS,
} from '@/lib/api-utils';
import { validateUpdateWorkout } from '@/lib/workout-validation';
import type { UpdateWorkoutRequest, WorkoutResponse, UpdateExerciseData } from '@/types/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch workout with all related data
    const workout = await prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
        completions: {
          orderBy: {
            completedAt: 'desc',
          },
        },
        _count: {
          select: {
            exercises: true,
            completions: true,
          },
        },
      },
    });

    if (!workout) {
      return createErrorResponse(
        `Workout with id ${id} not found`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Transform response
    const workoutResponse: WorkoutResponse = {
      id: workout.id,
      name: workout.name,
      description: workout.description,
      category: workout.category,
      isFavorite: workout.isFavorite,
      createdAt: workout.createdAt.toISOString(),
      updatedAt: workout.updatedAt.toISOString(),
      exerciseCount: workout._count.exercises,
      completionCount: workout._count.completions,
      lastCompleted: workout.completions[0]?.completedAt.toISOString() || null,
      exercises: workout.exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        reps: exercise.reps,
        sets: exercise.sets,
        duration: exercise.duration,
        notes: exercise.notes,
        order: exercise.order,
      })),
      completions: workout.completions.map((completion) => ({
        id: completion.id,
        completedAt: completion.completedAt.toISOString(),
        notes: completion.notes,
        duration: completion.duration,
      })),
    };

    return createSuccessResponse(workoutResponse);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if workout exists
    const existingWorkout = await prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: true,
      },
    });

    if (!existingWorkout) {
      return createErrorResponse(
        `Workout with id ${id} not found`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Parse and validate request body
    const body = await validateJsonBody<UpdateWorkoutRequest>(request);
    const validatedData = validateUpdateWorkout(body);

    // Update workout and exercises in a transaction
    const updatedWorkout = await prisma.$transaction(async (tx) => {
      // Update workout basic fields
      const workoutUpdateData: any = {};
      if (validatedData.name !== undefined) workoutUpdateData.name = validatedData.name;
      if (validatedData.description !== undefined) workoutUpdateData.description = validatedData.description;
      if (validatedData.category !== undefined) workoutUpdateData.category = validatedData.category;

      let workout = existingWorkout;

      // Update workout if there are changes
      if (Object.keys(workoutUpdateData).length > 0) {
        workout = await tx.workout.update({
          where: { id },
          data: workoutUpdateData,
          include: {
            exercises: true,
          },
        });
      }

      // Handle exercises if provided
      if (validatedData.exercises) {
        await handleExerciseUpdates(tx, id, validatedData.exercises, existingWorkout.exercises);
      }

      // Fetch the complete updated workout
      const completeWorkout = await tx.workout.findUnique({
        where: { id },
        include: {
          exercises: {
            orderBy: {
              order: 'asc',
            },
          },
          completions: {
            orderBy: {
              completedAt: 'desc',
            },
            take: 1,
          },
          _count: {
            select: {
              exercises: true,
              completions: true,
            },
          },
        },
      });

      return completeWorkout;
    });

    if (!updatedWorkout) {
      return createErrorResponse(
        'Failed to update workout',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    // Transform response
    const workoutResponse: WorkoutResponse = {
      id: updatedWorkout.id,
      name: updatedWorkout.name,
      description: updatedWorkout.description,
      category: updatedWorkout.category,
      isFavorite: updatedWorkout.isFavorite,
      createdAt: updatedWorkout.createdAt.toISOString(),
      updatedAt: updatedWorkout.updatedAt.toISOString(),
      exerciseCount: updatedWorkout._count.exercises,
      completionCount: updatedWorkout._count.completions,
      lastCompleted: updatedWorkout.completions[0]?.completedAt.toISOString() || null,
      exercises: updatedWorkout.exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        reps: exercise.reps,
        sets: exercise.sets,
        duration: exercise.duration,
        notes: exercise.notes,
        order: exercise.order,
      })),
    };

    return createSuccessResponse(workoutResponse);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if workout exists
    const existingWorkout = await prisma.workout.findUnique({
      where: { id },
    });

    if (!existingWorkout) {
      return createErrorResponse(
        `Workout with id ${id} not found`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Delete workout (cascade will handle exercises and completions)
    await prisma.workout.delete({
      where: { id },
    });

    return createSuccessResponse(
      { message: 'Workout deleted successfully' },
      HTTP_STATUS.NO_CONTENT
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper function to handle exercise updates
async function handleExerciseUpdates(
  tx: any,
  workoutId: string,
  exerciseUpdates: UpdateExerciseData[],
  existingExercises: any[]
) {
  const existingExerciseIds = new Set(existingExercises.map(e => e.id));
  const updatedExerciseIds = new Set();

  for (const exerciseData of exerciseUpdates) {
    if (exerciseData._action === 'delete' && exerciseData.id) {
      // Delete exercise
      await tx.exercise.delete({
        where: { id: exerciseData.id },
      });
      continue;
    }

    if (exerciseData.id && existingExerciseIds.has(exerciseData.id)) {
      // Update existing exercise
      const updateData: any = {};
      if (exerciseData.name !== undefined) updateData.name = exerciseData.name;
      if (exerciseData.reps !== undefined) updateData.reps = exerciseData.reps;
      if (exerciseData.sets !== undefined) updateData.sets = exerciseData.sets;
      if (exerciseData.duration !== undefined) updateData.duration = exerciseData.duration;
      if (exerciseData.notes !== undefined) updateData.notes = exerciseData.notes;
      if (exerciseData.order !== undefined) updateData.order = exerciseData.order;

      if (Object.keys(updateData).length > 0) {
        await tx.exercise.update({
          where: { id: exerciseData.id },
          data: updateData,
        });
      }

      updatedExerciseIds.add(exerciseData.id);
    } else {
      // Create new exercise
      const createData: any = {
        workoutId,
        name: exerciseData.name || 'Untitled Exercise',
        order: exerciseData.order || 0,
      };

      if (exerciseData.reps !== undefined) createData.reps = exerciseData.reps;
      if (exerciseData.sets !== undefined) createData.sets = exerciseData.sets;
      if (exerciseData.duration !== undefined) createData.duration = exerciseData.duration;
      if (exerciseData.notes !== undefined) createData.notes = exerciseData.notes;

      const newExercise = await tx.exercise.create({
        data: createData,
      });

      updatedExerciseIds.add(newExercise.id);
    }
  }

  // Remove exercises that weren't included in the update (unless explicitly handled)
  const exercisesToDelete = existingExercises
    .filter(e => !updatedExerciseIds.has(e.id))
    .filter(e => !exerciseUpdates.some(u => u.id === e.id && u._action !== 'delete'));

  // Only delete if the update included an exercises array and wasn't just partial updates
  const hasCompleteExerciseList = exerciseUpdates.some(e => !e.id || e._action === 'create');
  
  if (hasCompleteExerciseList && exercisesToDelete.length > 0) {
    await tx.exercise.deleteMany({
      where: {
        id: { in: exercisesToDelete.map(e => e.id) },
      },
    });
  }
}