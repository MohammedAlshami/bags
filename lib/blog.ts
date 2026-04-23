export type BlogStatus = "draft" | "published";

export type BlogBlockType = "heading" | "paragraph" | "image" | "quote" | "list" | "callout" | "divider";

export type BlogBlock =
  | { id: string; type: "heading"; level: 2 | 3 | 4; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "image"; src: string; alt: string; caption: string }
  | { id: string; type: "quote"; text: string; citation: string }
  | { id: string; type: "list"; ordered: boolean; items: string[] }
  | { id: string; type: "callout"; tone: "soft" | "accent" | "warning"; text: string }
  | { id: string; type: "divider" };

export type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  author_name: string;
  status: string;
  content: unknown;
  seo_title: string;
  seo_description: string;
  tags: unknown;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPostRecord = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  authorName: string;
  status: BlogStatus;
  content: BlogBlock[];
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function idFromCrypto(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `blog-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

export function createBlogBlockId() {
  return idFromCrypto();
}

export function slugifyBlogTitle(input: string) {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug;
}

export function normalizeBlogStatus(value: unknown, fallback: BlogStatus = "draft"): BlogStatus {
  return value === "published" || value === "draft" ? value : fallback;
}

export function normalizeBlogTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

export function createBlogBlock(type: BlogBlockType): BlogBlock {
  const id = createBlogBlockId();
  switch (type) {
    case "heading":
      return { id, type, level: 2, text: "" };
    case "paragraph":
      return { id, type, text: "" };
    case "image":
      return { id, type, src: "", alt: "", caption: "" };
    case "quote":
      return { id, type, text: "", citation: "" };
    case "list":
      return { id, type, ordered: false, items: [""] };
    case "callout":
      return { id, type, tone: "soft", text: "" };
    case "divider":
      return { id, type };
  }
}

export function normalizeBlogBlocks(value: unknown): BlogBlock[] {
  if (!Array.isArray(value)) return [];

  const out: BlogBlock[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : createBlogBlockId();
    const type = raw.type;

    if (type === "heading") {
      const levelRaw = Number(raw.level);
      const level = levelRaw === 3 || levelRaw === 4 ? levelRaw : 2;
      const text = typeof raw.text === "string" ? raw.text.trim() : "";
      if (!text) continue;
      out.push({ id, type, level, text });
      continue;
    }

    if (type === "paragraph") {
      const text = typeof raw.text === "string" ? raw.text.trim() : "";
      if (!text) continue;
      out.push({ id, type, text });
      continue;
    }

    if (type === "image") {
      const src = typeof raw.src === "string" ? raw.src.trim() : "";
      const alt = typeof raw.alt === "string" ? raw.alt.trim() : "";
      const caption = typeof raw.caption === "string" ? raw.caption.trim() : "";
      if (!src || !alt) continue;
      out.push({ id, type, src, alt, caption });
      continue;
    }

    if (type === "quote") {
      const text = typeof raw.text === "string" ? raw.text.trim() : "";
      const citation = typeof raw.citation === "string" ? raw.citation.trim() : "";
      if (!text) continue;
      out.push({ id, type, text, citation });
      continue;
    }

    if (type === "list") {
      const ordered = raw.ordered === true;
      const items = Array.isArray(raw.items)
        ? raw.items
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean)
        : [];
      if (items.length === 0) continue;
      out.push({ id, type, ordered, items });
      continue;
    }

    if (type === "callout") {
      const toneRaw = raw.tone;
      const tone = toneRaw === "accent" || toneRaw === "warning" ? toneRaw : "soft";
      const text = typeof raw.text === "string" ? raw.text.trim() : "";
      if (!text) continue;
      out.push({ id, type, tone, text });
      continue;
    }

    if (type === "divider") {
      out.push({ id, type });
    }
  }

  return out;
}

export function mapBlogPost(row: BlogPostRow): BlogPostRecord {
  const status = normalizeBlogStatus(row.status);
  return {
    _id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    coverImage: row.cover_image,
    authorName: row.author_name,
    status,
    content: normalizeBlogBlocks(row.content),
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    tags: normalizeBlogTags(row.tags),
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
