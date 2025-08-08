// API Middleware utilities
import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, HTTP_STATUS } from './api-utils';

// CORS headers for API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Method validation middleware
export function validateHttpMethod(
  request: NextRequest,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return createErrorResponse(
      `Method ${request.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
      HTTP_STATUS.METHOD_NOT_ALLOWED
    );
  }
  return null;
}

// Handle OPTIONS requests for CORS preflight
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Add CORS headers to response
export function addCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Request logging middleware
export function logRequest(request: NextRequest, context?: string) {
  const timestamp = new Date().toISOString();
  const method = request.method;
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} ${context ? `(${context})` : ''} - ${userAgent}`);
}

// Rate limiting helper (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  for (const [key, data] of requestCounts.entries()) {
    if (data.resetTime < now) {
      requestCounts.delete(key);
    }
  }
  
  const existing = requestCounts.get(identifier);
  
  if (!existing || existing.resetTime < now) {
    // New window
    const resetTime = now + windowMs;
    requestCounts.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }
  
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: existing.resetTime };
  }
  
  existing.count++;
  return { allowed: true, remaining: limit - existing.count, resetTime: existing.resetTime };
}

// Get client IP address
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddress = request.headers.get('remote-address');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  return realIp || remoteAddress || 'unknown';
}

// Content-Type validation
export function validateContentType(request: NextRequest): NextResponse | null {
  const contentType = request.headers.get('content-type');
  
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    if (!contentType || !contentType.includes('application/json')) {
      return createErrorResponse(
        'Content-Type must be application/json',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }
  
  return null;
}

// Generic API route wrapper with common middleware
export function withApiMiddleware<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  options?: {
    allowedMethods?: string[];
    requireAuth?: boolean;
    rateLimit?: { limit: number; windowMs: number };
    cors?: boolean;
  }
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const { 
      allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      requireAuth = false,
      rateLimit,
      cors = true,
    } = options || {};

    try {
      // Log request
      logRequest(request);

      // Handle OPTIONS for CORS
      if (request.method === 'OPTIONS') {
        return handleOptions();
      }

      // Validate HTTP method
      const methodError = validateHttpMethod(request, allowedMethods);
      if (methodError) {
        return cors ? addCorsHeaders(methodError) : methodError;
      }

      // Validate Content-Type for data methods
      const contentTypeError = validateContentType(request);
      if (contentTypeError) {
        return cors ? addCorsHeaders(contentTypeError) : contentTypeError;
      }

      // Rate limiting
      if (rateLimit) {
        const clientIP = getClientIP(request);
        const rateLimitResult = checkRateLimit(
          clientIP,
          rateLimit.limit,
          rateLimit.windowMs
        );

        if (!rateLimitResult.allowed) {
          const response = createErrorResponse(
            'Too many requests',
            429 // Too Many Requests
          );
          response.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString());
          return cors ? addCorsHeaders(response) : response;
        }

        // Add rate limit headers to successful responses
      }

      // TODO: Add authentication middleware here if requireAuth is true

      // Call the actual handler
      const response = await handler(...args);

      // Add CORS headers if enabled
      return cors ? addCorsHeaders(response) : response;

    } catch (error) {
      console.error('API Middleware Error:', error);
      const errorResponse = createErrorResponse(
        'Internal server error',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
      return cors ? addCorsHeaders(errorResponse) : errorResponse;
    }
  };
}