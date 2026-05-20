function slugify(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getUuidPrefix(id: string): string {
  return id.split("-")[0] ?? "";
}

export function productUrl(id: string, name: string): string {
  const prefix = getUuidPrefix(id);
  const slug = slugify(name);
  return `/product/${prefix}-${slug}`;
}

export function blogUrl(id: string, title: string): string {
  const prefix = getUuidPrefix(id);
  const slug = slugify(title);
  return `/blog/${prefix}-${slug}`;
}

export function parseProductSlugParam(param: string): { prefix: string } {
  const prefix = param.split("-")[0] ?? "";
  return { prefix };
}

export function parseBlogSlugParam(param: string): { slug: string } {
  const parts = param.split("-");
  parts.shift();
  return { slug: parts.join("-") };
}
