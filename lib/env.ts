import { z } from 'zod'

/**
 * Environment variable validation
 * Ensures all required environment variables are present and valid
 */

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // n8n Configuration
  N8N_WEBHOOK_URL: z.string().url().optional(),
  N8N_BASE_URL: z.string().url().optional(),
  USE_ANTHROPIC_DIRECT: z.enum(['true', 'false']).default('false'),

  // Anthropic API (optional - only needed if USE_ANTHROPIC_DIRECT=true)
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // Next.js
  NEXT_PUBLIC_CONTACT_WEBHOOK_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validate and parse environment variables
 * Throws an error if validation fails
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env)

    // Additional validation logic
    if (env.USE_ANTHROPIC_DIRECT === 'true' && !env.ANTHROPIC_API_KEY) {
      throw new Error(
        'ANTHROPIC_API_KEY is required when USE_ANTHROPIC_DIRECT=true'
      )
    }

    if (env.USE_ANTHROPIC_DIRECT === 'false' && !env.N8N_WEBHOOK_URL) {
      console.warn(
        'Warning: N8N_WEBHOOK_URL not set. Using default http://localhost:5678/webhook/twitter-demo'
      )
    }

    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(
        issue => `${issue.path.join('.')}: ${issue.message}`
      )
      throw new Error(
        `Environment validation failed:\n${issues.join('\n')}`
      )
    }
    throw error
  }
}

/**
 * Get validated environment variables
 * Safe to use throughout the application
 */
export const env = validateEnv()
