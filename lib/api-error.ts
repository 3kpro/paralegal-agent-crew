/**
 * Centralized API Error Handling
 *
 * Provides standardized error responses and authentication wrapper for API routes.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Custom error class for API errors with HTTP status codes
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Standard error response format
 */
interface ErrorResponse {
  error: string;
  details?: any;
  timestamp: string;
}

/**
 * Creates a standardized error response
 */
export function errorResponse(
  error: unknown,
  defaultStatus: number = 500,
): NextResponse<ErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode },
    );
  }

  // Handle generic errors
  const message =
    error instanceof Error ? error.message : "Internal server error";

  return NextResponse.json(
    {
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status: defaultStatus },
  );
}

/**
 * API route handler with authentication
 */
export type AuthenticatedHandler<T = any> = (
  request: Request,
  user: User,
) => Promise<NextResponse<T>>;

/**
 * Wraps an API route handler with authentication and error handling
 *
 * @example
 * export const POST = withAuth(async (request, user) => {
 *   // Your authenticated handler logic here
 *   return NextResponse.json({ success: true })
 * })
 */
export function withAuth<T = any>(
  handler: AuthenticatedHandler<T>,
): (request: Request) => Promise<NextResponse<T | ErrorResponse>> {
  return async (request: Request) => {
    try {
      const supabase = await createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new AppError(401, "Unauthorized - Authentication required");
      }

      return await handler(request, user);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/**
 * Common API errors for convenience
 */
export const errors = {
  unauthorized: () =>
    new AppError(401, "Unauthorized - Authentication required"),
  forbidden: (message?: string) =>
    new AppError(403, message || "Forbidden - Insufficient permissions"),
  notFound: (resource?: string) =>
    new AppError(404, resource ? `${resource} not found` : "Not found"),
  badRequest: (message: string, details?: any) =>
    new AppError(400, message, details),
  conflict: (message: string) => new AppError(409, message),
  tooManyRequests: () =>
    new AppError(429, "Too many requests - Please try again later"),
  internal: (message?: string) =>
    new AppError(500, message || "Internal server error"),
} as const;
