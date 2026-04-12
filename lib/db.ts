import { neon } from "@neondatabase/serverless";

type NeonSql = ReturnType<typeof neon>;

let client: NeonSql | undefined;

function getClient(): NeonSql {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("Please define the DATABASE_URL environment variable");
    }
    client = neon(url);
  }
  return client;
}

export const sql = new Proxy(
  function () {
    /* tagged template proxy target */
  },
  {
    apply(_target, thisArg, argArray) {
      return Reflect.apply(getClient(), thisArg, argArray as never);
    },
  },
) as NeonSql;
