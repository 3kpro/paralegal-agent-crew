import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { redis } from "@/lib/redis";

// Simple fetch with retry implementation
async function fetchWithRetry(
  url: string,
  options: { retries: number; retryDelay: number },
) {
  let lastError: Error | null = null;

  for (let i = 0; i <= options.retries; i++) {
    try {
      const response = await fetch(url);
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < options.retries) {
        await new Promise((resolve) => setTimeout(resolve, options.retryDelay));
      }
    }
  }

  throw lastError;
}

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  services: {
    database: {
      status: "connected" | "disconnected" | "error";
      responseTime?: number;
      lastChecked: string;
      metrics?: any;
    };
    redis: {
      status: "connected" | "disconnected" | "error";
      responseTime?: number;
      lastChecked: string;
    };
    n8n?: {
      status: "connected" | "disconnected" | "error";
      responseTime?: number;
      lastChecked: string;
    };
  };
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

const serviceStartTime = Date.now();

export async function GET(): Promise<NextResponse> {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";

  const currentTime = Date.now();

  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    services: {
      database: {
        status: "disconnected",
        lastChecked: new Date().toISOString(),
      },
      redis: {
        status: "disconnected",
        lastChecked: new Date().toISOString(),
      },
    },
    uptime: currentTime - serviceStartTime,
    memory: {
      used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
      percentage: Math.round(
        (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) *
          100,
      ),
    },
  };

  // 1. Check Database Health
  try {
    const dbStartTime = Date.now();
    const supabase = await createClient();
    const { data: dbHealth, error } = await supabase.rpc("get_database_health");

    if (error) throw error;

    healthCheck.services.database = {
      status: "connected",
      responseTime: Date.now() - dbStartTime,
      lastChecked: new Date().toISOString(),
      metrics: dbHealth,
    };

    // Warn if cache hit ratio is low
    if (dbHealth && dbHealth.cache_hit_ratio < 90) {
      healthCheck.status = "degraded";
    }
  } catch (error: any) {
    console.error("Database health check failed:", error);
    healthCheck.services.database = {
      status: "error",
      lastChecked: new Date().toISOString(),
    };
    healthCheck.status = "unhealthy";
  }

  // 2. Check Redis Health
  try {
    const redisStartTime = Date.now();
    await redis.ping();

    healthCheck.services.redis = {
      status: "connected",
      responseTime: Date.now() - redisStartTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Redis health check failed:", error);
    healthCheck.services.redis = {
      status: "disconnected",
      lastChecked: new Date().toISOString(),
    };
    // Redis is optional - don't mark as unhealthy
    if (healthCheck.status === "healthy") {
      healthCheck.status = "degraded";
    }
  }

  // 3. Check n8n (optional - local development only)
  if (!isVercel && !isProduction) {
    try {
      const n8nUrl = process.env.N8N_BASE_URL || "http://localhost:5678";
      const n8nStartTime = Date.now();

      const n8nResponse = await fetchWithRetry(`${n8nUrl}/healthz`, {
        retries: 2,
        retryDelay: 500,
      });

      const n8nResponseTime = Date.now() - n8nStartTime;

      if (n8nResponse.ok) {
        healthCheck.services.n8n = {
          status: "connected",
          responseTime: n8nResponseTime,
          lastChecked: new Date().toISOString(),
        };
      } else {
        healthCheck.services.n8n = {
          status: "error",
          responseTime: n8nResponseTime,
          lastChecked: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("n8n health check failed:", error);
      healthCheck.services.n8n = {
        status: "disconnected",
        lastChecked: new Date().toISOString(),
      };
    }
  }

  // Determine overall health status based on critical services
  // Database is critical, Redis is optional
  const databaseHealthy = healthCheck.services.database.status === "connected";
  const hasCriticalError = healthCheck.services.database.status === "error";

  if (hasCriticalError || !databaseHealthy) {
    healthCheck.status = "unhealthy";
    return NextResponse.json(healthCheck, { status: 503 });
  }

  // Return appropriate status code
  const httpStatus = healthCheck.status === "unhealthy" ? 503 : 200;
  return NextResponse.json(healthCheck, { status: httpStatus });
}
