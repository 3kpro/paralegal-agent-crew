import { z } from 'zod'

// Twitter thread request validation schema
export const twitterThreadSchema = z.object({
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(5000, 'Content must not exceed 5000 characters'),

  style: z.enum(['professional', 'casual', 'educational'])
    .optional()
    .default('professional'),

  includeEmojis: z.boolean()
    .optional()
    .default(false),

  includeHashtags: z.boolean()
    .optional()
    .default(true)
})

export type TwitterThreadRequest = z.infer<typeof twitterThreadSchema>

// Validation error formatter
export function formatValidationError(error: z.ZodError): string {
  const errors = error.errors.map(err => {
    const field = err.path.join('.')
    return `${field}: ${err.message}`
  })

  return errors.join(', ')
}

// User-friendly validation error messages
export function getValidationErrorMessage(error: z.ZodError): string {
  try {
    // Zod errors have an issues array
    const issues = error.issues || error.errors || []

    if (issues.length === 0) {
      return 'Invalid request data'
    }

    // Return the first error message
    return issues[0].message || 'Invalid request data'
  } catch (e) {
    return 'Invalid request data'
  }
}
