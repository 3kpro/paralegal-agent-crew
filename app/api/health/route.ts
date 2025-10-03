import { NextResponse } from 'next/server'
import { fetchWithRetry } from '@/lib/fetch-with-retry'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    n8n: {
      status: 'connected' | 'disconnected' | 'error'
      responseTime?: number
      lastChecked: string
    }
    database?: {
      status: 'connected' | 'disconnected' | 'error'
      responseTime?: number
      lastChecked: string
    }
  }
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
}

let serviceStartTime = Date.now()

export async function GET(): Promise<NextResponse> {
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      n8n: {
        status: 'disconnected',
        lastChecked: new Date().toISOString()
      }
    },
    uptime: Date.now() - serviceStartTime,
    memory: {
      used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
      percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
    }
  }

  try {
    // Check n8n connectivity with retry
    const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678'
    const n8nStartTime = Date.now()

    const n8nResponse = await fetchWithRetry(`${n8nUrl}/healthz`, {
      retries: 2,
      retryDelay: 500
    })

    const n8nResponseTime = Date.now() - n8nStartTime

    if (n8nResponse.ok) {
      healthCheck.services.n8n = {
        status: 'connected',
        responseTime: n8nResponseTime,
        lastChecked: new Date().toISOString()
      }
    } else {
      healthCheck.services.n8n = {
        status: 'error',
        responseTime: n8nResponseTime,
        lastChecked: new Date().toISOString()
      }
      healthCheck.status = 'degraded'
    }

  } catch (error) {
    console.error('Health check error:', error)
    healthCheck.services.n8n = {
      status: 'disconnected',
      lastChecked: new Date().toISOString()
    }
    healthCheck.status = 'degraded'
  }

  // Determine overall health status
  const hasErrors = Object.values(healthCheck.services).some(service => service.status === 'error')
  const hasDisconnected = Object.values(healthCheck.services).some(service => service.status === 'disconnected')

  if (hasErrors) {
    healthCheck.status = 'unhealthy'
    return NextResponse.json(healthCheck, { status: 503 })
  } else if (hasDisconnected) {
    healthCheck.status = 'degraded'
    return NextResponse.json(healthCheck, { status: 200 })
  } else {
    healthCheck.status = 'healthy'
    return NextResponse.json(healthCheck, { status: 200 })
  }
}
