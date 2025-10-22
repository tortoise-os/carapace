/**
 * Carapace API Server
 * Using Elysia.js - https://elysiajs.com
 */

import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { CarapaceSDK } from '@carapace/sdk';
import { config } from './config';
import { testConnection } from './db/client';
import { createPoolPlugin } from './routes/pools';

// Initialize SDK
const sdk = new CarapaceSDK({
  network: config.sui.network,
  rpcUrl: config.sui.rpcUrl,
  packageIds: config.sui.packageIds,
});

// Create Elysia app
const app = new Elysia()
  .use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  }))
  .decorate('sdk', sdk)
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  .use(createPoolPlugin)
  .onError(({ code, error, set }) => {
    console.error('Error:', error);

    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: 'Validation error',
        details: error.message,
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: 'Not found',
      };
    }

    set.status = 500;
    return {
      success: false,
      error: error.message || 'Internal server error',
    };
  });

// Start server
async function start() {
  try {
    // Test database connection (non-fatal)
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.log('⚠️  Running in mock mode - database unavailable');
    }

    app.listen(config.server.port, () => {
      console.log(`
🐢 Carapace API Server (Elysia.js)

Environment: ${config.server.env}
Network: ${config.sui.network}
Port: ${config.server.port}
Package ID: ${config.sui.packageIds.carapace}
Mode: ${dbConnected ? 'Database' : 'Mock Data'}

Server running at http://${config.server.host}:${config.server.port}
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
