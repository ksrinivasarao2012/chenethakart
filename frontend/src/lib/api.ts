export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

// On the server we call FastAPI directly; in the browser we go through the /api proxy
// (see next.config.mjs) so the httpOnly auth cookie stays same-origin.
const base = () =>
  typeof window === "undefined" ? process.env.API_URL ?? "http://127.0.0.1:8000" : "/api";

type Options = Omit<RequestInit, "body"> & { json?: unknown };

export async function api<T>(path: string, { json, headers, ...init }: Options = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(base() + path, {
      cache: "no-store",
      credentials: "same-origin",
      ...init,
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
  } catch {
    throw new ApiError("We couldn't reach the server. Please check your connection and try again.", 0);
  }
  if (!res.ok) {
    let detail = "Something went wrong. Please try again.";
    let fields: Record<string, string> = {};
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
      if (body.fields) fields = body.fields;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(detail, res.status, fields);
  }
  return (await res.json()) as T;
}

export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong. Please try again.";
