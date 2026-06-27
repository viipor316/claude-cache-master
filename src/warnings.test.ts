import { describe, it, expect } from "vitest";
import { detectVolatileContent } from "./warnings";

describe("detectVolatileContent", () => {
  it("returns no warnings for static text", () => {
    const warnings = detectVolatileContent(
      "This is a static documentation brief with no volatile content."
    );
    expect(warnings).toHaveLength(0);
  });

  it("flags an ISO 8601 timestamp", () => {
    const warnings = detectVolatileContent(
      "Request generated at 2026-06-27T10:15:00 for this session."
    );
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toMatch(/timestamp/i);
  });

  it("flags a unix epoch timestamp", () => {
    const warnings = detectVolatileContent("session_id: 1719504900");
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("flags a UUID", () => {
    const warnings = detectVolatileContent(
      "trace-id: 550e8400-e29b-41d4-a716-446655440000"
    );
    expect(warnings.some((w) => /uuid/i.test(w))).toBe(true);
  });
});
