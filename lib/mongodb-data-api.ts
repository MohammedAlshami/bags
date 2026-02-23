/**
 * MongoDB Atlas Data API (REST) client.
 * Uses POST https://data.mongodb-api.com/app/<app-id>/endpoint/data/v1/action/<action>
 * Auth: apiKey header. Set MONGODB_DATA_API_APP_ID and MONGODB_DATA_API_KEY in .env.local
 */

const BASE = process.env.MONGODB_DATA_API_BASE_URL ?? "https://data.mongodb-api.com/app";
const APP_ID = process.env.MONGODB_DATA_API_APP_ID;
const API_KEY = process.env.MONGODB_DATA_API_KEY;
const DATA_SOURCE = process.env.MONGODB_DATA_SOURCE ?? "Cluster0";

const DATA_API_URL = APP_ID ? `${BASE}/${APP_ID}/endpoint/data/v1` : null;

export type DataApiAction =
  | "find"
  | "findOne"
  | "insertOne"
  | "insertMany"
  | "updateOne"
  | "updateMany"
  | "deleteOne"
  | "deleteMany"
  | "aggregate";

type ActionPayload = {
  dataSource: string;
  database: string;
  collection: string;
  [key: string]: unknown;
};

export async function dataApiRequest<T = unknown>(
  action: DataApiAction,
  payload: Omit<ActionPayload, "dataSource"> & { dataSource?: string }
): Promise<T> {
  if (!APP_ID || !API_KEY) {
    throw new Error(
      "Missing MONGODB_DATA_API_APP_ID or MONGODB_DATA_API_KEY. Add them to .env.local (see .env.example)."
    );
  }
  if (!DATA_API_URL) {
    throw new Error("MONGODB_DATA_API_APP_ID is not set.");
  }

  const { dataSource: _ds, database, collection, ...rest } = payload;
  const body = {
    dataSource: _ds ?? DATA_SOURCE,
    database,
    collection,
    ...rest,
  };

  const res = await fetch(`${DATA_API_URL}/action/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      apiKey: API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MongoDB Data API error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as T;
  return data;
}

const DB = "carol_Bouwer";

export async function insertProducts(documents: { name: string; price: string; category: string; image: string; slug: string }[]) {
  return dataApiRequest<{ insertedIds: unknown[] }>("insertMany", {
    database: DB,
    collection: "products",
    documents,
  });
}

export async function findProducts(filter: Record<string, unknown> = {}) {
  const out = await dataApiRequest<{ documents: unknown[] }>("find", {
    database: DB,
    collection: "products",
    filter,
  });
  return out.documents;
}

export async function insertLanding(document: Record<string, unknown>) {
  return dataApiRequest<{ insertedId: unknown }>("insertOne", {
    database: DB,
    collection: "landing",
    document,
  });
}

export async function findLanding() {
  const out = await dataApiRequest<{ documents: unknown[] }>("find", {
    database: DB,
    collection: "landing",
    filter: {},
    limit: 1,
  });
  return out.documents[0] ?? null;
}

export async function deleteManyProducts() {
  return dataApiRequest("deleteMany", {
    database: DB,
    collection: "products",
    filter: {},
  });
}

export async function deleteManyLanding() {
  return dataApiRequest("deleteMany", {
    database: DB,
    collection: "landing",
    filter: {},
  });
}
