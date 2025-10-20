/**
 * Carapace API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { CarapaceSDK } from '@carapace/sdk';
import { config } from './config';
import { testConnection } from './db/client';
import { createPoolRoutes } from './routes/pools';

const app = express();

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize SDK
const sdk = new CarapaceSDK({
  network: config.sui.network,
  rpcUrl: config.sui.rpcUrl,
  packageIds: config.sui.packageIds,
});

// Routes
app.use('/api/pools', createPoolRoutes(sdk));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
async function start() {
  try {
    // Test database connection
    await testConnection();

    app.listen(config.server.port, config.server.host, () => {
      console.log(`
🐢 Carapace API Server

Environment: ${config.server.env}
Network: ${config.sui.network}
Port: ${config.server.port}
Package ID: ${config.sui.packageIds.carapace}

Server running at http://${config.server.host}:${config.server.port}
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
