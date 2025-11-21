/**
 * Parse tRPC validation errors and return user-friendly messages
 */
export function parseValidationError(error: any): string {
  if (!error) return "An error occurred";

  // Handle tRPC error with cause
  if (error.cause?.fieldErrors) {
    const fieldErrors = error.cause.fieldErrors;
    const firstField = Object.keys(fieldErrors)[0];
    if (firstField && fieldErrors[firstField]?.length > 0) {
      const errorMsg = fieldErrors[firstField][0];
      return formatFieldError(firstField, errorMsg);
    }
  }

  // Handle direct validation error message
  if (error.message) {
    return error.message;
  }

  // Handle generic error
  return "Validation failed. Please check your input.";
}

/**
 * Format field-specific error messages
 */
function formatFieldError(field: string, error: string): string {
  // Handle Zod error messages
  if (error.includes("String must contain at least")) {
    const match = error.match(/at least (\d+)/);
    const minLength = match ? match[1] : "required";
    return `${formatFieldName(field)} is too short (minimum ${minLength} characters)`;
  }

  if (error.includes("String must contain at most")) {
    const match = error.match(/at most (\d+)/);
    const maxLength = match ? match[1] : "exceeded";
    return `${formatFieldName(field)} is too long (maximum ${maxLength} characters)`;
  }

  if (error.includes("Required")) {
    return `${formatFieldName(field)} is required`;
  }

  if (error.includes("Expected number")) {
    return `${formatFieldName(field)} must be a number`;
  }

  // Return the original error if no pattern matches
  return `${formatFieldName(field)}: ${error}`;
}

/**
 * Convert field names to readable format
 */
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1") // Add space before capitals
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}

/**
 * Extract all validation errors from tRPC error
 */
export function getAllValidationErrors(error: any): Record<string, string> {
  const errors: Record<string, string> = {};

  if (error?.cause?.fieldErrors) {
    const fieldErrors = error.cause.fieldErrors;
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        errors[field] = formatFieldError(field, messages[0] as string);
      }
    }
  }

  return errors;
}
