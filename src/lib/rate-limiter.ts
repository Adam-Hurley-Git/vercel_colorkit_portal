/**
 * In-memory rate limiter for API endpoints
 *
 * IMPORTANT: This is a simple in-memory implementation suitable for:
 * - Single-instance deployments
 * - Low to medium traffic (< 100K requests/hour)
 * - Development and testing
 *
 * For production with multiple serverless instances, consider:
 * - Vercel Edge Config
 * - Upstash Redis
 * - Vercel KV
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Store rate limit records in memory
// Key format: "identifier:endpoint"
const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up old records every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (e.g., user ID, IP address)
 * @param limit - Maximum number of requests allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @param endpoint - Optional endpoint name for separate rate limits per endpoint
 * @returns true if request is allowed, false if rate limited
 */
export function rateLimit(identifier: string, limit: number, windowMs: number, endpoint?: string): boolean {
  const now = Date.now();
  const key = endpoint ? `${identifier}:${endpoint}` : identifier;

  // Cleanup old records periodically
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    cleanup();
    lastCleanup = now;
  }

  // Get or create record
  const record = rateLimitMap.get(key) || {
    count: 0,
    resetTime: now + windowMs,
  };

  // Reset window if expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  // Increment count
  record.count++;
  rateLimitMap.set(key, record);

  // Check if over limit
  return record.count <= limit;
}

/**
 * Get current rate limit status for an identifier
 *
 * @param identifier - Unique identifier
 * @param endpoint - Optional endpoint name
 * @returns Current count and time until reset (ms), or null if no record exists
 */
export function getRateLimitStatus(identifier: string, endpoint?: string): { count: number; resetIn: number } | null {
  const now = Date.now();
  const key = endpoint ? `${identifier}:${endpoint}` : identifier;
  const record = rateLimitMap.get(key);

  if (!record) {
    return null;
  }

  return {
    count: record.count,
    resetIn: Math.max(0, record.resetTime - now),
  };
}

/**
 * Remove expired rate limit records
 */
function cleanup(): void {
  const now = Date.now();
  let removed = 0;

  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime + 60000) {
      // Remove if expired + 1 minute grace period
      rateLimitMap.delete(key);
      removed++;
    }
  }

  if (removed > 0) {
    console.log(`[rate-limiter] Cleaned up ${removed} expired records`);
  }
}

/**
 * Clear all rate limit records (useful for testing)
 */
export function clearRateLimits(): void {
  rateLimitMap.clear();
  console.log('[rate-limiter] All rate limits cleared');
}

/**
 * Get total number of tracked identifiers
 */
export function getRateLimitMapSize(): number {
  return rateLimitMap.size;
}
