import { z } from "zod";

/**
 * Environment variable validation
 * Ensures all required environment variables are present and valid
 */

const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Supabase (REQUIRED - authentication & database)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required",
  }),

  // Stripe (REQUIRED - payments)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_", {
    message: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_",
  }),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", {
    message: "STRIPE_SECRET_KEY must start with sk_",
  }),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", {
    message: "STRIPE_WEBHOOK_SECRET must start with whsec_",
  }),

  // Application URL (REQUIRED)
  NEXT_PUBLIC_BASE_URL: z.string().url({
    message: "NEXT_PUBLIC_BASE_URL must be a valid URL",
  }),

  // n8n Configuration (optional)
  N8N_WEBHOOK_URL: z.string().url().optional(),
  N8N_BASE_URL: z.string().url().optional(),
  USE_ANTHROPIC_DIRECT: z.enum(["true", "false"]).default("false"),

  // Anthropic API (optional - only needed if USE_ANTHROPIC_DIRECT=true)
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // LM Studio (optional - local AI)
  LM_STUDIO_URL: z.string().url().optional(),

  // API Gateway (optional - production microservices)
  API_GATEWAY_URL: z.string().url().optional(),

  // PowerShell Trends Service (optional)
  POWERSHELL_TRENDS_URL: z.string().url().optional(),

  // Next.js
  NEXT_PUBLIC_CONTACT_WEBHOOK_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 * Throws an error if validation fails
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);

    // Additional validation logic
    if (env.USE_ANTHROPIC_DIRECT === "true" && !env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is required when USE_ANTHROPIC_DIRECT=true",
      );
    }

    if (env.USE_ANTHROPIC_DIRECT === "false" && !env.N8N_WEBHOOK_URL) {
      console.warn(
        "Warning: N8N_WEBHOOK_URL not set. Using default http://localhost:5678/webhook/twitter-demo",
      );
    }

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      throw new Error(`Environment validation failed:\n${issues.join("\n")}`);
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Safe to use throughout the application
 */
export const env = validateEnv();
