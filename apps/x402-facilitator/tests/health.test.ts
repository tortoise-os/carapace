/**
 * TDD Tests for GET /health endpoint
 */

import { describe, it, expect } from 'bun:test';

const BASE_URL = 'http://localhost:3402';

describe('GET /health', () => {
  it('should return healthy status', async () => {
    // Act
    const response = await fetch(`${BASE_URL}/health`);

    // Assert
    expect(response.status).toBe(200);
    const result = await response.json();

    expect(result.status).toBe('healthy');
    expect(result.version).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it('should respond very quickly (under 50ms)', async () => {
    // Act
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/health`);
    const duration = Date.now() - startTime;

    // Assert
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(50);
  });
});
