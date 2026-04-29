import { getCloudflareEnvBinding, getRuntimeEnv } from "@/lib/cloudflare-runtime-env";

type SqlPrimitive = string | number | boolean | null;
type SqlRow = Record<string, unknown>;

type D1PreparedStatement = {
  bind: (...values: SqlPrimitive[]) => {
    all: () => Promise<{ results?: SqlRow[] }>;
    run: () => Promise<{ results?: SqlRow[] }>;
  };
};

type D1DatabaseBinding = {
  prepare: (query: string) => D1PreparedStatement;
};

type SqlTemplate = (
  strings: TemplateStringsArray,
  ...values: SqlPrimitive[]
) => Promise<SqlRow[]>;

let databaseBinding: D1DatabaseBinding | null | undefined;

function getD1Binding() {
  if (databaseBinding !== undefined) return databaseBinding;
  databaseBinding = getCloudflareEnvBinding<D1DatabaseBinding>("DB") ?? null;
  return databaseBinding;
}

function getRequiredEnv(name: string) {
  const value = getRuntimeEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildQuery(strings: TemplateStringsArray, values: SqlPrimitive[]) {
  let text = "";
  const params: SqlPrimitive[] = [];
  for (let i = 0; i < strings.length; i += 1) {
    text += strings[i];
    if (i < values.length) {
      text += "?";
      params.push(values[i]);
    }
  }
  return { text: transformPostgresToSqlite(text), params };
}

function transformPostgresToSqlite(query: string) {
  return query
    .replace(/::(uuid|jsonb|int|integer|float|float8|numeric|text|date|timestamptz)/gi, "")
    .replace(/\bILIKE\b/g, "LIKE")
    .replace(/\bnow\(\)/gi, "CURRENT_TIMESTAMP");
}

async function queryViaBinding(query: string, params: SqlPrimitive[]) {
  const db = getD1Binding();
  if (!db) return null;
  const statement = db.prepare(query).bind(...params);
  const isReadQuery = /^\s*(select|with|pragma)\b/i.test(query) || /\breturning\b/i.test(query);
  const result = isReadQuery ? await statement.all() : await statement.run();
  return result.results ?? [];
}

async function queryViaHttp(query: string, params: SqlPrimitive[]) {
  const accountId = getRequiredEnv("CLOUDFLARE_ACCOUNT_ID");
  const databaseId = getRequiredEnv("CLOUDFLARE_DATABASE_ID");
  const token = getRequiredEnv("CLOUDFLARE_D1_TOKEN");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: query, params }),
    },
  );

  if (!res.ok) {
    throw new Error(`D1 query failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    success?: boolean;
    errors?: Array<{ message?: string }>;
    result?: Array<{ success?: boolean; results?: SqlRow[] }>;
  };

  if (!data.success) {
    throw new Error(data.errors?.[0]?.message ?? "D1 query failed");
  }

  const result = data.result?.[0];
  if (!result?.success) {
    throw new Error("D1 statement failed");
  }

  return result.results ?? [];
}

const sqlImpl: SqlTemplate = async (strings, ...values) => {
  const { text, params } = buildQuery(strings, values);
  const bindingResult = await queryViaBinding(text, params);
  if (bindingResult) return bindingResult;
  return queryViaHttp(text, params);
};

export const sql = sqlImpl;
