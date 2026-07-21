import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";

import {
  createIntegrationEventSchema,
  IntegrationEventMetadataSchema,
} from "../src/events/integration-event";
import { ProblemDetailsSchema } from "../src/http/problem-details";
import {
  CursorPageInfoSchema,
  CursorPaginationRequestSchema,
} from "../src/pagination/cursor";

describe("ProblemDetailsSchema", () => {
  it("accepts extension members", () => {
    const result = ProblemDetailsSchema.parse({
      requestId: "request-123",
      status: 404,
      title: "Not found",
      type: "https://support.example/problems/not-found",
    });

    expect(result["requestId"]).toBe("request-123");
  });

  it("rejects missing required members and non-error status codes", () => {
    expect(() =>
      ProblemDetailsSchema.parse({ status: 200, title: "OK", type: "about:blank" }),
    ).toThrow();
    expect(() => ProblemDetailsSchema.parse({ status: 500 })).toThrow();
  });
});

describe("cursor pagination schemas", () => {
  it("accepts a positive limit without imposing a product maximum", () => {
    expect(
      CursorPaginationRequestSchema.parse({ cursor: "next", limit: 500 }),
    ).toEqual({ cursor: "next", limit: 500 });
  });

  it("requires an end cursor when another page exists", () => {
    expect(() =>
      CursorPageInfoSchema.parse({ endCursor: null, hasNextPage: true }),
    ).toThrow();
    expect(
      CursorPageInfoSchema.parse({ endCursor: null, hasNextPage: false }),
    ).toEqual({ endCursor: null, hasNextPage: false });
  });

  it("rejects invalid limits", () => {
    expect(() => CursorPaginationRequestSchema.parse({ limit: 0 })).toThrow();
    expect(() => CursorPaginationRequestSchema.parse({ limit: 1.5 })).toThrow();
  });
});

describe("integration event schemas", () => {
  it("validates metadata and preserves payload inference", () => {
    const RepositoryPayloadSchema = z.strictObject({ repositoryId: z.string() });
    const RepositoryEventSchema = createIntegrationEventSchema(
      RepositoryPayloadSchema,
    );
    const event = RepositoryEventSchema.parse({
      id: "event-1",
      occurredAt: "2026-07-21T12:00:00Z",
      payload: { repositoryId: "repository-1" },
      schemaVersion: 1,
      type: "repository.created",
    });

    expectTypeOf(event.payload).toEqualTypeOf<{ repositoryId: string }>();
    expect(event.payload.repositoryId).toBe("repository-1");
  });

  it("rejects invalid timestamps and versions", () => {
    expect(() =>
      IntegrationEventMetadataSchema.parse({
        id: "event-1",
        occurredAt: "not-a-date",
        schemaVersion: 0,
        type: "repository.created",
      }),
    ).toThrow();
  });
});
