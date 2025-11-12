/**
 * GET /health - Health check endpoint
 */

import { Elysia } from 'elysia';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  version: string;
  timestamp: number;
  uptime: number;
}

const startTime = Date.now();

export const healthRoute = new Elysia()
  .get('/health', (): HealthStatus => {
    return {
      status: 'healthy',
      version: '0.1.0',
      timestamp: Date.now(),
      uptime: Date.now() - startTime,
    };
  });
