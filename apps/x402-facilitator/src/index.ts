/**
 * Sui x402 Facilitator Service
 *
 * A production-ready payment facilitator for the x402 protocol on Sui blockchain.
 * Built with Elysia (Bun-native) for maximum performance.
 */

import { Elysia } from 'elysia';
import { config, validateConfig } from './config';
import { healthRoute } from './routes/health';
import { verifyRoute } from './routes/verify';
import { settleRoute } from './routes/settle';
import { supportedRoute } from './routes/supported';

/**
 * Create Elysia app instance
 */
export function createApp() {
  return new Elysia()
    // CORS middleware
    .onRequest(({ request, set }) => {
      set.headers['Access-Control-Allow-Origin'] = '*';
      set.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      set.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Payment';

      // Handle preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204 });
      }
    })

    // Logging middleware
    .onRequest(({ request }) => {
      console.log(`[${new Date().toISOString()}] ${request.method} ${new URL(request.url).pathname}`);
    })

    // Error handling
    .onError(({ code, error, set }) => {
      console.error('Error:', code, error);

      if (code === 'VALIDATION') {
        set.status = 400;
        return {
          error: 'Validation error',
          details: error.message,
        };
      }

      if (code === 'NOT_FOUND') {
        set.status = 404;
        return {
          error: 'Not found',
          path: error.message,
        };
      }

      set.status = 500;
      return {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    })

    // Routes
    .use(healthRoute)
    .use(verifyRoute)
    .use(settleRoute)
    .use(supportedRoute)

    // Root endpoint
    .get('/', () => ({
      name: 'Sui x402 Facilitator',
      version: '0.1.0',
      endpoints: {
        health: 'GET /health',
        verify: 'POST /verify',
        settle: 'POST /settle',
        supported: 'GET /supported',
      },
      documentation: 'https://github.com/coinbase/x402',
    }));
}

/**
 * Start the server (only if run directly)
 */
if (import.meta.main) {
  try {
    // Validate configuration
    validateConfig();

    // Create and start app
    const app = createApp();

    app.listen(config.port, () => {
      console.log('╔════════════════════════════════════════════════════╗');
      console.log('║   Sui x402 Facilitator                             ║');
      console.log('╠════════════════════════════════════════════════════╣');
      console.log(`║   Port:     ${config.port.toString().padEnd(40)} ║`);
      console.log(`║   Network:  ${config.suiRpcUrl.padEnd(40)} ║`);
      console.log(`║   Status:   Healthy                                ║`);
      console.log('╚════════════════════════════════════════════════════╝');
      console.log();
      console.log('Endpoints:');
      console.log(`  GET  http://localhost:${config.port}/health`);
      console.log(`  POST http://localhost:${config.port}/verify`);
      console.log(`  POST http://localhost:${config.port}/settle`);
      console.log(`  GET  http://localhost:${config.port}/supported`);
      console.log();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
