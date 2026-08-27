import type { APIRequestContext, APIResponse } from '@playwright/test';

export type JsonValue = any;

/**
 * API client (Page-Object-Model equivalent for the HTTP layer).
 * Wraps Playwright's APIRequestContext with typed helpers.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async get(path: string): Promise<APIResponse> {
    return this.request.get(path);
  }

  async postJson(path: string, json: JsonValue): Promise<APIResponse> {
    return this.request.post(path, {
      data: json,
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, application/problem+json',
      },
    });
  }

  async postRaw(path: string, body: string, contentType: string): Promise<APIResponse> {
    return this.request.post(path, {
      data: body,
      headers: {
        'content-type': contentType,
        accept: 'application/json, application/problem+json',
      },
    });
  }
}

export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
};

/** Returns true if the object has the minimum RFC7807 Problem Details shape. */
export function looksLikeProblemDetails(obj: any): obj is ProblemDetails {
  return (
    !!obj &&
    typeof obj === 'object' &&
    typeof obj.status === 'number' &&
    typeof obj.detail === 'string'
  );
}

/**
 * Asserts that the response body does not expose internal Java/Spring implementation details.
 * Patterns are intentionally narrow to avoid false-positives on URIs or safe English text.
 *
 * AC4 coverage (also verified by GlobalExceptionHandlerTest unit test).
 */
export function assertNoInternalLeak(text: string): void {
  const leakPatterns: RegExp[] = [
    /NullPointerException/,
    /StackOverflowError/,
    /ClassNotFoundException/,
    /IllegalArgumentException/,
    // Stack trace line pattern: "at com.example.Foo.bar(Foo.java:42)"
    /\bat\s+\w[\w.]+\([\w.]+:\d+\)/,
    // Spring / Hibernate framework names in error context
    /springframework\.web\.servlet/i,
    /hibernate\.validator/i,
    // Internal message fragments that should be suppressed in 500 responses
    /Sensitive\s+DB\s+error/i,
  ];

  for (const p of leakPatterns) {
    if (p.test(text)) {
      throw new Error(
        `Internal implementation detail leaked in response: pattern ${p} matched.\n` +
          `Response body (first 300 chars): ${text.substring(0, 300)}`,
      );
    }
  }
}
