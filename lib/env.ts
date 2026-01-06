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
  }).optional(), // Optional on client
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", {
    message: "STRIPE_WEBHOOK_SECRET must start with whsec_",
  }).optional(), // Optional on client

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
  // Explicitly access process.env for Next.js inlining
  const processEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
    N8N_BASE_URL: process.env.N8N_BASE_URL,
    USE_ANTHROPIC_DIRECT: process.env.USE_ANTHROPIC_DIRECT,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    LM_STUDIO_URL: process.env.LM_STUDIO_URL,
    API_GATEWAY_URL: process.env.API_GATEWAY_URL,
    POWERSHELL_TRENDS_URL: process.env.POWERSHELL_TRENDS_URL,
    NEXT_PUBLIC_CONTACT_WEBHOOK_URL: process.env.NEXT_PUBLIC_CONTACT_WEBHOOK_URL,
  };

  try {
    const isServer = typeof window === 'undefined';
    
    // On client, we don't validate server-side keys
    let parsed: any;
    
    if (isServer) {
        parsed = envSchema.parse(processEnv);
        // Additional server-side validation
        if (parsed.STRIPE_SECRET_KEY === undefined) throw new Error("STRIPE_SECRET_KEY is required on server");
        if (parsed.STRIPE_WEBHOOK_SECRET === undefined) throw new Error("STRIPE_WEBHOOK_SECRET is required on server");
    } else {
        // Client-side: validate only what we have, allow missing server keys
        parsed = envSchema.parse(processEnv);
    }

    // Additional validation logic
    if (parsed.USE_ANTHROPIC_DIRECT === "true" && !parsed.ANTHROPIC_API_KEY) {
      if (isServer) { // Only enforce on server if key is hidden
         throw new Error("ANTHROPIC_API_KEY is required when USE_ANTHROPIC_DIRECT=true");
      }
    }

    return parsed as Env;
  } catch (error) {
    // OLD FIX: Allow build to proceed even if env vars are missing
    if (
      process.env.npm_lifecycle_event === "build" || 
      process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.VERCEL || 
      process.env.CI
    ) {
      console.warn("⚠️ Environment validation failed during build. Using fallback values to allow build to complete.");
      console.warn(error instanceof Error ? error.message : String(error));
      
      return {
        NODE_ENV: "production",
        NEXT_PUBLIC_SUPABASE_URL: "https://placeholder-url.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder-key",
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_" + "test_placeholder",
        STRIPE_SECRET_KEY: "sk_" + "test_placeholder",
        STRIPE_WEBHOOK_SECRET: "whsec_" + "placeholder",
        NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
        USE_ANTHROPIC_DIRECT: "false",
      } as Env;
    }

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
