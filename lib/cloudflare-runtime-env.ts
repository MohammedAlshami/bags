type CloudflareContext = {
  env?: Record<string, unknown>;
} | null;

function getCloudflareContext(): CloudflareContext {
  return (globalThis as typeof globalThis & {
    [key: symbol]: CloudflareContext;
  })[Symbol.for("__cloudflare-context__")] ?? null;
}

export function getCloudflareEnvBinding<T = unknown>(name: string): T | undefined {
  const env = getCloudflareContext()?.env;
  if (!env || !(name in env)) return undefined;
  return env[name] as T;
}

export function getRuntimeEnv(name: string): string | undefined {
  const cloudflareValue = getCloudflareEnvBinding(name);
  if (typeof cloudflareValue === "string" && cloudflareValue.length > 0) {
    return cloudflareValue;
  }

  const processValue = process.env[name];
  if (typeof processValue === "string" && processValue.length > 0) {
    return processValue;
  }

  return undefined;
}
