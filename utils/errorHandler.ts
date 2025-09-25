import { toast } from 'sonner'

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
  status?: number
}

export class AppError extends Error {
  public readonly code: string
  public readonly status: number
  public readonly details?: Record<string, any>

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500, details?: Record<string, any>) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.details = details
  }
}

/**
 * Standardizes error handling across the application
 */
export function handleApiError(error: unknown): ApiError {
  // If it's already an ApiError, return it
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return error as ApiError
  }

  // If it's a Response object (fetch API)
  if (error instanceof Response) {
    return {
      message: `HTTP Error: ${error.status} ${error.statusText}`,
      code: 'HTTP_ERROR',
      status: error.status
    }
  }

  // If it's a regular Error
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'GENERIC_ERROR'
    }
  }

  // If it's a network error or fetch failure
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'STRING_ERROR'
    }
  }

  // Default fallback
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR'
  }
}

/**
 * Shows appropriate toast notifications for different types of errors
 */
export function showErrorToast(error: unknown, fallbackMessage?: string): void {
  const apiError = handleApiError(error)

  let message = apiError.message

  // Handle specific error codes
  switch (apiError.code) {
    case 'NETWORK_ERROR':
      message = 'Network error. Please check your connection.'
      break
    case 'UNAUTHORIZED':
      message = 'You are not authorized to perform this action.'
      break
    case 'FORBIDDEN':
      message = 'Access denied. Please check your permissions.'
      break
    case 'NOT_FOUND':
      message = 'The requested resource was not found.'
      break
    case 'VALIDATION_ERROR':
      message = apiError.details?.validation || 'Please check your input and try again.'
      break
    case 'SERVER_ERROR':
      message = 'Server error. Please try again later.'
      break
  }

  toast.error(fallbackMessage || message, {
    description: apiError.details?.description,
    action: apiError.status === 401 ? {
      label: 'Login',
      onClick: () => window.location.href = '/login'
    } : undefined
  })
}

/**
 * Shows success toast notifications
 */
export function showSuccessToast(message: string, description?: string): void {
  toast.success(message, {
    description
  })
}

/**
 * Shows info toast notifications
 */
export function showInfoToast(message: string, description?: string): void {
  toast.info(message, {
    description
  })
}

/**
 * Shows warning toast notifications
 */
export function showWarningToast(message: string, description?: string): void {
  toast.warning(message, {
    description
  })
}

/**
 * Promise wrapper that automatically handles errors with toast notifications
 */
export async function withErrorHandling<T>(
  promise: Promise<T>,
  successMessage?: string,
  errorMessage?: string
): Promise<T | null> {
  try {
    const result = await promise
    if (successMessage) {
      showSuccessToast(successMessage)
    }
    return result
  } catch (error) {
    showErrorToast(error, errorMessage)
    return null
  }
}

/**
 * Validation error formatter
 */
export function formatValidationErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('; ')
}