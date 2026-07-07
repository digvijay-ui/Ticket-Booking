export function createIdempotencyKey(prefix = 'eventbooking') {
  const randomPart = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}-${Date.now()}-${randomPart}`;
}
