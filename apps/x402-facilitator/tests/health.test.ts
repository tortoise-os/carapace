/**
 * TDD Tests for GET /health endpoint
 */

import { describe, it, expect } from 'bun:test';

const BASE_URL = 'http://localhost:3606';

describe('GET /health', () => {
  it('should return healthy status', async () => {
    // Act
    const response = await fetch(`${BASE_URL}/health`);

    // Assert
    expect(response.status).toBe(200);
    const result = (await response.json()) as { status: string; version: string; timestamp: number };

    expect(result.status).toBe('healthy');
    expect(result.version).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it('should respond quickly (under 500ms)', async () => {
    // Act
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/health`);
    const duration = Date.now() - startTime;

    // Assert
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(500); // Increased due to wallet balance check
  });
});
