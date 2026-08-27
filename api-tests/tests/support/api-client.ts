import type { APIRequestContext, APIResponse } from '@playwright/test';

export type JsonValue = any;

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

export function looksLikeProblemDetails(obj: any): obj is ProblemDetails {
  return !!obj && typeof obj === 'object' && typeof obj.status === 'number' && typeof obj.detail === 'string';
}

export function assertNoInternalLeak(text: string): void {
  const leakPatterns: RegExp[] = [
    /Exception/i,
    /StackTrace/i,
    /org\./,
    /com\./,
    /java\./,
    /springframework/i,
    /NullPointer/i,
    /\.[A-Za-z]+:\d+/, // file:line style
  ];

  for (const p of leakPatterns) {
    if (p.test(text)) {
      throw new Error(`Internal implementation detail leaked in response body: pattern ${p} matched.`);
    }
  }
}
