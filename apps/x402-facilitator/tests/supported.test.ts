/**
 * TDD Tests for GET /supported endpoint
 */

import { describe, it, expect } from 'bun:test';

const BASE_URL = 'http://localhost:3402';

describe('GET /supported', () => {
  it('should return supported schemes and networks', async () => {
    // Act
    const response = await fetch(`${BASE_URL}/supported`);

    // Assert
    expect(response.status).toBe(200);
    const result = await response.json();

    expect(result.schemes).toBeDefined();
    expect(Array.isArray(result.schemes)).toBe(true);
    expect(result.schemes).toContain('exact');

    expect(result.networks).toBeDefined();
    expect(Array.isArray(result.networks)).toBe(true);
    expect(result.networks.length).toBeGreaterThan(0);

    // Should support at least one Sui network
    const hasSuiNetwork = result.networks.some((n: string) => n.startsWith('sui:'));
    expect(hasSuiNetwork).toBe(true);
  });

  it('should respond quickly (under 100ms)', async () => {
    // Act
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/supported`);
    const duration = Date.now() - startTime;

    // Assert
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(100);
  });
});
