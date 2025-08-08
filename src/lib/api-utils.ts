// API Utilities for validation and error handling
import { NextResponse } from 'next/server';
import { ApiError } from '@/types/api';

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error response helper
export function createErrorResponse(
  message: string,
  statusCode: number,
  details?: any
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: getErrorType(statusCode),
      message,
      details,
    },
    { status: statusCode }
  );
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = HTTP_STATUS.OK
): NextResponse<T> {
  return NextResponse.json(data, { status: statusCode });
}

// Get error type based on status code
function getErrorType(statusCode: number): string {
  switch (statusCode) {
    case HTTP_STATUS.BAD_REQUEST:
      return 'Bad Request';
    case HTTP_STATUS.UNAUTHORIZED:
      return 'Unauthorized';
    case HTTP_STATUS.FORBIDDEN:
      return 'Forbidden';
    case HTTP_STATUS.NOT_FOUND:
      return 'Not Found';
    case HTTP_STATUS.METHOD_NOT_ALLOWED:
      return 'Method Not Allowed';
    case HTTP_STATUS.CONFLICT:
      return 'Conflict';
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return 'Unprocessable Entity';
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return 'Internal Server Error';
    default:
      return 'Unknown Error';
  }
}

// Validation helpers
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateString(value: any, fieldName: string, minLength?: number, maxLength?: number): string | null {
  if (typeof value !== 'string') {
    return `${fieldName} must be a string`;
  }
  
  if (minLength !== undefined && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`;
  }
  
  return null;
}

export function validateNumber(value: any, fieldName: string, min?: number, max?: number): string | null {
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== undefined && num > max) {
    return `${fieldName} must be no more than ${max}`;
  }
  
  return null;
}

export function validateArray(value: any, fieldName: string): string | null {
  if (!Array.isArray(value)) {
    return `${fieldName} must be an array`;
  }
  return null;
}

export function validateWorkoutCategory(category: string): string | null {
  const validCategories = ['strength', 'cardio', 'flexibility', 'sports', 'other'];
  if (!validCategories.includes(category.toLowerCase())) {
    return `Category must be one of: ${validCategories.join(', ')}`;
  }
  return null;
}

// Parse query parameters
export function parseQueryParams(url: string) {
  const { searchParams } = new URL(url);
  return {
    category: searchParams.get('category'),
    search: searchParams.get('search'),
    favorite: searchParams.get('favorite'),
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Max 100 items per page
  };
}

// Sanitize input strings
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

// Handle Prisma errors
export function handlePrismaError(error: any): NextResponse<ApiError> {
  console.error('Prisma error:', error);

  // Handle known Prisma error codes
  if (error.code === 'P2002') {
    return createErrorResponse(
      'A record with this data already exists',
      HTTP_STATUS.CONFLICT,
      { field: error.meta?.target }
    );
  }
  
  if (error.code === 'P2025') {
    return createErrorResponse(
      'Record not found',
      HTTP_STATUS.NOT_FOUND
    );
  }
  
  if (error.code === 'P2003') {
    return createErrorResponse(
      'Foreign key constraint failed',
      HTTP_STATUS.BAD_REQUEST,
      { field: error.meta?.field_name }
    );
  }

  // Generic database error
  return createErrorResponse(
    'Database operation failed',
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
  );
}

// Generic error handler for API routes
export function handleApiError(error: any): NextResponse<ApiError> {
  console.error('API error:', error);

  if (error.name === 'ValidationError') {
    return createErrorResponse(
      error.message,
      HTTP_STATUS.BAD_REQUEST,
      error.details
    );
  }

  // Handle Prisma errors
  if (error.code && error.code.startsWith('P')) {
    return handlePrismaError(error);
  }

  // Generic error
  return createErrorResponse(
    'An unexpected error occurred',
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
  );
}

// Custom validation error class
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Validate JSON body
export async function validateJsonBody<T>(request: Request): Promise<T> {
  try {
    const body = await request.json();
    return body as T;
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body');
  }
}