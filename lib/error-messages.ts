/**
 * User-friendly error messages for common failure scenarios
 */

export const ERROR_MESSAGES = {
  // n8n related errors
  N8N_NOT_FOUND: {
    code: "N8N_WORKFLOW_NOT_FOUND",
    message:
      "The workflow service is not available. Please ensure n8n is running and the workflow is activated.",
    userMessage:
      "The content generation service is currently unavailable. Please try again later.",
  },
  N8N_SERVER_ERROR: {
    code: "N8N_SERVER_ERROR",
    message: "n8n server returned an error. Check n8n logs for details.",
    userMessage:
      "There was an error processing your request. Our team has been notified.",
  },
  N8N_TIMEOUT: {
    code: "N8N_TIMEOUT",
    message: "Request to n8n workflow timed out.",
    userMessage:
      "The request took too long to process. Please try again with shorter content.",
  },
  N8N_CONNECTION_FAILED: {
    code: "N8N_CONNECTION_FAILED",
    message: "Could not connect to n8n service.",
    userMessage:
      "Unable to connect to the content generation service. Please try again later.",
  },

  // Input validation errors
  CONTENT_REQUIRED: {
    code: "CONTENT_REQUIRED",
    message: "Content is required",
    userMessage: "Please provide content to transform.",
  },
  CONTENT_TOO_LONG: {
    code: "CONTENT_TOO_LONG",
    message: "Content exceeds maximum length",
    userMessage:
      "Your content is too long. Please keep it under 5000 characters.",
  },
  INVALID_STYLE: {
    code: "INVALID_STYLE",
    message: "Invalid style parameter",
    userMessage:
      "Please select a valid style (professional, casual, or educational).",
  },

  // Generic errors
  UNKNOWN_ERROR: {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
    userMessage: "Something went wrong. Please try again.",
  },
} as const;

/**
 * Get error details from HTTP status code
 */
export function getErrorFromStatus(status: number) {
  switch (status) {
    case 404:
      return ERROR_MESSAGES.N8N_NOT_FOUND;
    case 500:
    case 502:
    case 503:
      return ERROR_MESSAGES.N8N_SERVER_ERROR;
    case 504:
      return ERROR_MESSAGES.N8N_TIMEOUT;
    default:
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
}

/**
 * Get error details from error type
 */
export function getErrorFromException(error: unknown) {
  if (error instanceof Error) {
    // Network/connection errors
    if (
      error.message.includes("fetch") ||
      error.message.includes("ECONNREFUSED")
    ) {
      return ERROR_MESSAGES.N8N_CONNECTION_FAILED;
    }

    // Timeout errors
    if (
      error.message.includes("timeout") ||
      error.message.includes("ETIMEDOUT")
    ) {
      return ERROR_MESSAGES.N8N_TIMEOUT;
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
