export const TEST_DATA_PATTERNS = [
  "test",
  "qa",
  "smoke",
  "refundtarget",
  "idempotency"
];

export const TEST_DATA_REGEX = new RegExp(TEST_DATA_PATTERNS.join("|"), "i");

export const createNonTestTextFilter = (fields: string[]): Record<string, unknown> => ({
  $and: fields.map((field) => ({
    [field]: { $not: TEST_DATA_REGEX }
  }))
});

export const isLikelyTestText = (value: unknown): boolean =>
  typeof value === "string" && TEST_DATA_REGEX.test(value);

export const createExcludeEventIdsFilter = (
  eventIds: unknown[]
): Record<string, unknown> => {
  if (!eventIds.length) {
    return {};
  }

  return {
    eventId: { $nin: eventIds }
  };
};
