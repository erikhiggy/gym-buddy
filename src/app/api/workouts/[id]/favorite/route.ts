// PATCH /api/workouts/[id]/favorite - Toggle favorite status

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  HTTP_STATUS,
} from '@/lib/api-utils';
import type { WorkoutResponse } from '@/types/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if workout exists
    const existingWorkout = await prisma.workout.findUnique({
      where: { id },
      select: {
        id: true,
        isFavorite: true,
      },
    });

    if (!existingWorkout) {
      return createErrorResponse(
        `Workout with id ${id} not found`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Toggle favorite status
    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: {
        isFavorite: !existingWorkout.isFavorite,
      },
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