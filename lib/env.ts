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

    return env;
  } catch (error) {
    // START FIX: Allow build to proceed even if env vars are missing
    // This is useful for building in environments (like limited CI or Docker) 
    // where runtime secrets aren't available but build should pass.
    if (process.env.npm_lifecycle_event === "build" || process.env.NEXT_PHASE === "phase-production-build") {
      console.warn("⚠️ Environment validation failed during build. Using fallback values to allow build to complete.");
      console.warn(error instanceof Error ? error.message : String(error));
      
      // Return a mock object satisfying the schema for build purposes ONLY
      return {
        NODE_ENV: "production",
        NEXT_PUBLIC_SUPABASE_URL: "https://placeholder-url.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder-key",
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_placeholder",
        STRIPE_SECRET_KEY: "sk_test_placeholder",
        STRIPE_WEBHOOK_SECRET: "whsec_placeholder",
        NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
        USE_ANTHROPIC_DIRECT: "false",
      } as Env;
    }
    // END FIX

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
