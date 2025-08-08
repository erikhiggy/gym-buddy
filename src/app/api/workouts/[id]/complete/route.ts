// POST /api/workouts/[id]/complete - Mark workout as completed

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateJsonBody,
  HTTP_STATUS,
} from '@/lib/api-utils';
import { validateCompleteWorkout } from '@/lib/workout-validation';
import type { CompleteWorkoutRequest, WorkoutCompletionResponse } from '@/types/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if workout exists
    const existingWorkout = await prisma.workout.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!existingWorkout) {
      return createErrorResponse(
        `Workout with id ${id} not found`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Parse and validate request body
    const body = await validateJsonBody<CompleteWorkoutRequest>(request);
    const validatedData = validateCompleteWorkout(body);

    // Create workout completion
    const completion = await prisma.workoutCompletion.create({
      data: {
        workoutId: id,
        notes: validatedData.notes,
        duration: validatedData.duration,
      },
    });

    // Transform response
    const completionResponse: WorkoutCompletionResponse = {
      id: completion.id,
      completedAt: completion.completedAt.toISOString(),
      notes: completion.notes,
      duration: completion.duration,
    };

    return createSuccessResponse(
      {
        message: 'Workout completed successfully',
        completion: completionResponse,
      },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return handleApiError(error);
  }
}