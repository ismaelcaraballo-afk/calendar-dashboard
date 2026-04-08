// dev-harness/mocks/next.ts
//
// Minimal type stubs for 'next' so the restv1api files typecheck without
// installing the full Next.js package. Express's Request/Response is
// already structurally compatible — this just satisfies the import.

export interface NextApiRequest {
  method?: string;
  query: Record<string, string | string[]>;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
}

export interface NextApiResponse<T = any> {
  status(code: number): NextApiResponse<T>;
  json(body: T): void;
  send(body: T): void;
  end(): void;
  setHeader(name: string, value: string | string[]): void;
}
