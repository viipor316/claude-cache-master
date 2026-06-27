const TIMESTAMP_PATTERNS = [
  /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO 8601
  /\b\d{10,13}\b/, // unix epoch (s or ms)
];

const UUID_PATTERN =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;

export function detectVolatileContent(text: string): string[] {
  const warnings: string[] = [];

  // Strip UUIDs first so their embedded digit runs don't also trigger the
  // timestamp check (e.g. "...a716-446655440000" looks like a 12-digit epoch).
  const textWithoutUuids = text.replace(UUID_PATTERN, "");

  if (TIMESTAMP_PATTERNS.some((p) => p.test(textWithoutUuids))) {
    warnings.push(
      "You included what looks like a timestamp inside a cached block. " +
        "This will break the cache prefix match on every request and cause a 100% cache miss rate."
    );
  }

  if (UUID_PATTERN.test(text)) {
    warnings.push(
      "You included what looks like a UUID inside a cached block. " +
        "If this value changes between requests, it will invalidate the cache."
    );
  }

  return warnings;
}

export function printVolatileWarnings(text: string): void {
  for (const warning of detectVolatileContent(text)) {
    console.warn(`[ClaudeCache Warning]: ${warning}`);
  }
}
