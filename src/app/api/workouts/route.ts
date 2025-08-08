// GET /api/workouts - Fetch all workouts with optional filtering
// POST /api/workouts - Create new workout with exercises

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  parseQueryParams,
  validateJsonBody,
  HTTP_STATUS,
} from '@/lib/api-utils';
import { validateCreateWorkout } from '@/lib/workout-validation';
import type { CreateWorkoutRequest, WorkoutResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const { category, search, favorite, page, limit } = parseQueryParams(request.url);

    // Build where clause for filtering
    const where: any = {};

    if (category) {
      where.category = {
        equals: category.toLowerCase(),
        mode: 'insensitive',
      };
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (favorite !== null && favorite !== undefined) {
      where.isFavorite = favorite.toLowerCase() === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch workouts with related data
    const [workouts, totalCount] = await Promise.all([
      prisma.workout.findMany({
        where,
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
            take: 1, // Only get the latest completion for lastCompleted
          },
          _count: {
            select: {
              exercises: true,
              completions: true,
            },
          },
        },
        orderBy: [
          { isFavorite: 'desc' }, // Favorites first
          { updatedAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.workout.count({ where }),
    ]);

    // Transform data for response
    const workoutResponses: WorkoutResponse[] = workouts.map((workout) => ({
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
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return createSuccessResponse({
      data: workoutResponses,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await validateJsonBody<CreateWorkoutRequest>(request);
    const validatedData = validateCreateWorkout(body);

    // Create workout and exercises in a transaction
    const workout = await prisma.$transaction(async (tx) => {
      // Create the workout
      const newWorkout = await tx.workout.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          category: validatedData.category,
        },
      });

      // Create exercises
      if (validatedData.exercises.length > 0) {
        await tx.exercise.createMany({
          data: validatedData.exercises.map((exercise) => ({
            ...exercise,
            workoutId: newWorkout.id,
          })),
        });
      }

      // Fetch the complete workout with exercises
      const completeWorkout = await tx.workout.findUnique({
        where: { id: newWorkout.id },
        include: {
          exercises: {
            orderBy: {
              order: 'asc',
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

      return completeWorkout;
    });

    if (!workout) {
      return createErrorResponse(
        'Failed to create workout',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
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
      lastCompleted: null,
      exercises: workout.exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        reps: exercise.reps,
        sets: exercise.sets,
        duration: exercise.duration,
        notes: exercise.notes,
        order: exercise.order,
      })),
    };

    return createSuccessResponse(workoutResponse, HTTP_STATUS.CREATED);
  } catch (error) {
    return handleApiError(error);
  }
}