"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Eye,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { ConfirmModal } from "@/app/components/ConfirmModal";
import { SafeImage } from "@/app/components/SafeImage";
import { adminIconClassName, sans } from "@/lib/page-theme";
import {
  createBlogBlock,
  normalizeBlogBlocks,
  slugifyBlogTitle,
  type BlogBlock,
  type BlogBlockType,
  type BlogPostRecord,
  type BlogStatus,
} from "@/lib/blog";

type EditorState = {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  authorName: string;
  status: BlogStatus;
  seoTitle: string;
  seoDescription: string;
  tagsText: string;
  content: BlogBlock[];
};

const BLOCK_LABELS: Record<BlogBlockType, string> = {
  heading: "عنوان",
  paragraph: "فقرة",
  image: "صورة",
  quote: "اقتباس",
  list: "قائمة",
  callout: "تنبيه",
  divider: "فاصل",
};

const NEW_BLOCK_OPTIONS: BlogBlockType[] = ["paragraph", "heading", "image", "quote", "list", "callout", "divider"];

function emptyEditor(): EditorState {
  return {
    title: "",
    slug: "",
    excerpt: "",
    coverImage: "",
    authorName: "",
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    tagsText: "",
    content: [createBlogBlock("paragraph")],
  };
}

function editorFromPost(post: BlogPostRecord): EditorState {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    authorName: post.authorName,
    status: post.status,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    tagsText: post.tags.join(", "),
    content: post.content.length > 0 ? post.content : [createBlogBlock("paragraph")],
  };
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(date));
}

function statusClasses(status: BlogStatus) {
  return status === "published"
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

function replaceBlockType(block: BlogBlock, type: BlogBlockType): BlogBlock {
  const next = createBlogBlock(type);
  if (type === "heading" && block.type === "heading") {
    return { ...next, text: block.text, level: block.level };
  }
  if (type === "paragraph" && block.type === "paragraph") {
    return { ...next, text: block.text };
  }
  if (type === "image" && block.type === "image") {
    return { ...next, src: block.src, alt: block.alt, caption: block.caption };
  }
  if (type === "quote" && block.type === "quote") {
    return { ...next, text: block.text, citation: block.citation };
  }
  if (type === "list" && block.type === "list") {
    return { ...next, ordered: block.ordered, items: block.items.length ? block.items : [""] };
  }
  if (type === "callout" && block.type === "callout") {
    return { ...next, tone: block.tone, text: block.text };
  }
  return next;
}

function BlogBlockEditor({
  blocks,
  onChange,
}: {
  blocks: BlogBlock[];
  onChange: (next: BlogBlock[]) => void;
}) {
  const [newBlockType, setNewBlockType] = useState<BlogBlockType>("paragraph");

  const updateBlock = (index: number, next: BlogBlock) => {
    onChange(blocks.map((block, i) => (i === index ? next : block)));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addBlock = () => {
    onChange([...blocks, createBlogBlock(newBlockType)]);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-black/10 bg-white p-4">
        <select
          value={newBlockType}
          onChange={(e) => setNewBlockType(e.target.value as BlogBlockType)}
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm"
        >
          {NEW_BLOCK_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {BLOCK_LABELS[type]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addBlock}
          className="inline-flex items-center gap-2 rounded-full bg-[#b63a6b] px-4 py-2 text-sm font-medium text-white transition-[filter] hover:brightness-110"
        >
          <Plus className="h-4 w-4" aria-hidden />
          إضافة كتلة
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center text-sm text-neutral-500">
          لا توجد كتل بعد. أضيفي أول فقرة أو عنوان لبدء المقال.
        </div>
      ) : null}

      {blocks.map((block, index) => (
        <section key={block.id} className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-neutral-600">
                {BLOCK_LABELS[block.type]}
              </span>
              <select
                value={block.type}
                onChange={(e) => updateBlock(index, replaceBlockType(block, e.target.value as BlogBlockType))}
                className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs"
              >
                {NEW_BLOCK_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {BLOCK_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                disabled={index === 0}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-neutral-700 disabled:opacity-30"
                aria-label="تحريك للأعلى"
              >
                <ArrowUp className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                disabled={index === blocks.length - 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-neutral-700 disabled:opacity-30"
                aria-label="تحريك للأسفل"
              >
                <ArrowDown className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 text-red-600"
                aria-label="حذف الكتلة"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            {block.type === "heading" ? (
              <>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
                  <label className="text-xs text-neutral-500">المستوى</label>
                  <select
                    value={block.level}
                    onChange={(e) =>
                      updateBlock(index, { ...block, level: Number(e.target.value) as 2 | 3 | 4 })
                    }
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                  >
                    <option value={2}>H2</option>
                    <option value={3}>H3</option>
                    <option value={4}>H4</option>
                  </select>
                </div>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
                  <label className="text-xs text-neutral-500">النص</label>
                  <input
                    value={block.text}
                    onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
              </>
            ) : null}

            {block.type === "paragraph" ? (
              <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-start">
                <label className="text-xs text-neutral-500 pt-2">النص</label>
                <textarea
                  value={block.text}
                  onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                  className="min-h-28 rounded-xl border border-black/10 px-3 py-2 text-sm leading-7"
                  rows={5}
                />
              </div>
            ) : null}

            {block.type === "image" ? (
              <>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
                  <label className="text-xs text-neutral-500">الصورة</label>
                  <input
                    value={block.src}
                    onChange={(e) => updateBlock(index, { ...block, src: e.target.value })}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
                  <label className="text-xs text-neutral-500">النص البديل</label>
                  <input
                    value={block.alt}
                    onChange={(e) => updateBlock(index, { ...block, alt: e.target.value })}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
                  <label className="text-xs text-neutral-500">التعليق</label>
                  <input
                    value={block.caption}
                    onChange={(e) => updateBlock(index, { ...block, caption: e.target.value })}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
              </>
            ) : null}

            {block.type === "quote" ? (
              <>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-start">
                  <label className="text-xs text-neutral-500 pt-2">الاقتباس</label>
                  <textarea
                    value={block.text}
                    onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm leading-7"
                    rows={4}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
                  <label className="text-xs text-neutral-500">المصدر</label>
                  <input
                    value={block.citation}
                    onChange={(e) => updateBlock(index, { ...block, citation: e.target.value })}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                  />
                </div>
              </>
            ) : null}

            {block.type === "list" ? (
              <>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
                  <label className="text-xs text-neutral-500">النوع</label>
                  <select
                    value={block.ordered ? "ordered" : "unordered"}
                    onChange={(e) => updateBlock(index, { ...block, ordered: e.target.value === "ordered" })}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                  >
                    <option value="unordered">قائمة نقطية</option>
                    <option value="ordered">قائمة مرقمة</option>
                  </select>
                </div>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-start">
                  <label className="text-xs text-neutral-500 pt-2">العناصر</label>
                  <textarea
                    value={block.items.join("\n")}
                    onChange={(e) =>
                      updateBlock(index, {
                        ...block,
                        items: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                      })
                    }
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm leading-7"
                    rows={5}
                    placeholder="عنصر 1"
                  />
                </div>
              </>
            ) : null}

            {block.type === "callout" ? (
              <>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
                  <label className="text-xs text-neutral-500">النبرة</label>
                  <select
                    value={block.tone}
                    onChange={(e) => updateBlock(index, { ...block, tone: e.target.value as "soft" | "accent" | "warning" })}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                  >
                    <option value="soft">هادئ</option>
                    <option value="accent">مميز</option>
                    <option value="warning">تحذير</option>
                  </select>
                </div>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-start">
                  <label className="text-xs text-neutral-500 pt-2">النص</label>
                  <textarea
                    value={block.text}
                    onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm leading-7"
                    rows={4}
                  />
                </div>
              </>
            ) : null}

            {block.type === "divider" ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
                هذا البلوك يفصل بين الأقسام.
              </div>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(emptyEditor());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    const res = await fetch("/api/admin/blogs");
    const data = await res.json().catch(() => []);
    if (!res.ok) {
      const raw = typeof data.error === "string" ? data.error : "";
      throw new Error(raw || "Failed to load blogs");
    }
    return data as BlogPostRecord[];
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPosts()
      .then((list) => {
        if (!active) return;
        setPosts(list);
        setLoadError(null);
      })
      .catch((e) => {
        if (!active) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load blogs");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!panelOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [panelOpen]);

  const openCreate = () => {
    setEditingId(null);
    setEditor(emptyEditor());
    setError(null);
    setPanelOpen(true);
  };

  const openEdit = (post: BlogPostRecord) => {
    setEditingId(post._id);
    setEditor(editorFromPost(post));
    setError(null);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setError(null);
  };

  const uploadCover = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const raw = typeof data.error === "string" ? data.error : "";
      throw new Error(raw || "Upload failed");
    }
    return String((data as { url?: string }).url ?? "");
  };

  const savePost = async (publish = false) => {
    const title = editor.title.trim();
    const excerpt = editor.excerpt.trim();
    const authorName = editor.authorName.trim();
    const coverImage = editor.coverImage.trim();
    const slug = editor.slug.trim() || slugifyBlogTitle(title);
    const seoTitle = editor.seoTitle.trim();
    const seoDescription = editor.seoDescription.trim();
    const tags = editor.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const normalizedContent = normalizeBlogBlocks(editor.content);
    const status: BlogStatus = publish ? "published" : editor.status;

    if (!title) {
      setError("العنوان مطلوب.");
      return;
    }
    if (!excerpt) {
      setError("الملخص مطلوب.");
      return;
    }
    if (!authorName) {
      setError("اسم الكاتب مطلوب.");
      return;
    }
    if (status === "published" && normalizedContent.length === 0) {
      setError("أضيفي كتلة محتوى واحدة على الأقل قبل النشر.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        title,
        slug,
        excerpt,
        coverImage,
        authorName,
        status,
        seoTitle,
        seoDescription,
        tags,
        content: normalizedContent,
      };
      const url = editingId ? `/api/admin/blogs/${editingId}` : "/api/admin/blogs";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const raw = typeof data.error === "string" ? data.error : "";
        throw new Error(raw || "Failed to save blog post");
      }
      const next = await fetchPosts();
      setPosts(next);
      closePanel();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (post: BlogPostRecord) => {
    setBusyId(post._id);
    try {
      const res = await fetch(`/api/admin/blogs/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: post.status === "published" ? "draft" : "published" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const raw = typeof data.error === "string" ? data.error : "";
        throw new Error(raw || "Failed to update blog post");
      }
      setPosts(await fetchPosts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update blog post");
    } finally {
      setBusyId(null);
    }
  };

  const deletePost = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blogs/${deleteConfirmId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const raw = typeof data.error === "string" ? data.error : "";
        throw new Error(raw || "Failed to delete blog post");
      }
      setPosts(await fetchPosts());
      setDeleteConfirmId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete blog post");
    } finally {
      setDeleting(false);
    }
  };

  const onCoverFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadCover(file);
      if (url) setEditor((state) => ({ ...state, coverImage: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div dir="rtl" style={sans} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="h-8 w-40 animate-pulse rounded-full bg-neutral-200/80" />
          <div className="h-10 w-36 animate-pulse rounded-full bg-neutral-200/80" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-[1.75rem] border border-black/10 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
              <div className="aspect-[4/3] animate-pulse rounded-[1.25rem] bg-neutral-200/80" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-24 animate-pulse rounded-full bg-neutral-200/80" />
                <div className="h-6 w-4/5 animate-pulse rounded-full bg-neutral-200/80" />
                <div className="h-4 w-full animate-pulse rounded-full bg-neutral-200/80" />
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-neutral-200/80" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <p className="text-red-600" dir="rtl" style={sans}>
        {loadError}
      </p>
    );
  }

  const panel = panelOpen ? (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] cursor-pointer bg-black/40 transition-colors hover:bg-black/50"
        aria-label="إغلاق"
        onClick={closePanel}
      />
      <aside
        className="
          fixed z-[70] flex flex-col bg-white shadow-2xl
          inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10
          md:inset-x-auto md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-full md:max-h-none md:w-full md:max-w-[44rem] md:rounded-none md:border-t-0 md:border-l md:border-black/10
        "
      >
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
          <h3 className="text-lg font-medium">{editingId ? "تعديل مقال" : "مقال جديد"}</h3>
          <button
            type="button"
            onClick={closePanel}
            className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100"
            aria-label="إغلاق"
          >
            <X className={`h-5 w-5 ${adminIconClassName}`} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <label className="text-xs text-neutral-500">العنوان</label>
              <input
                value={editor.title}
                onChange={(e) => setEditor((state) => ({ ...state, title: e.target.value }))}
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-neutral-500">المسار (slug)</label>
              <input
                value={editor.slug}
                onChange={(e) => setEditor((state) => ({ ...state, slug: e.target.value }))}
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                dir="ltr"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-neutral-500">الملخص</label>
              <textarea
                value={editor.excerpt}
                onChange={(e) => setEditor((state) => ({ ...state, excerpt: e.target.value }))}
                className="min-h-28 rounded-xl border border-black/10 px-3 py-2 text-sm leading-7"
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-neutral-500">الصورة الرئيسية</label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onCoverFileChange}
              />
              <div className="overflow-hidden rounded-3xl border border-dashed border-black/10 bg-white p-4">
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[#f7eef2]">
                  {editor.coverImage ? (
                    <SafeImage src={editor.coverImage} alt="" fill className="object-cover object-center" sizes="(max-width: 768px) 100vw, 400px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-500">
                      <ImagePlus className={`h-8 w-8 ${adminIconClassName}`} aria-hidden />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full bg-[#b63a6b] px-4 py-2 text-sm text-white transition-[filter] hover:brightness-110"
                  >
                    <ImagePlus className="h-4 w-4" aria-hidden />
                    رفع صورة
                  </button>
                  <input
                    value={editor.coverImage}
                    onChange={(e) => setEditor((state) => ({ ...state, coverImage: e.target.value }))}
                    className="min-w-0 flex-1 rounded-full border border-black/10 px-4 py-2 text-sm"
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-neutral-500">اسم الكاتب</label>
              <input
                value={editor.authorName}
                onChange={(e) => setEditor((state) => ({ ...state, authorName: e.target.value }))}
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs text-neutral-500">الحالة</label>
                <select
                  value={editor.status}
                  onChange={(e) => setEditor((state) => ({ ...state, status: e.target.value as BlogStatus }))}
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                >
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-neutral-500">الوسوم</label>
                <input
                  value={editor.tagsText}
                  onChange={(e) => setEditor((state) => ({ ...state, tagsText: e.target.value }))}
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                  placeholder="بشرة, شعر, نصائح"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-neutral-500">SEO title</label>
              <input
                value={editor.seoTitle}
                onChange={(e) => setEditor((state) => ({ ...state, seoTitle: e.target.value }))}
                className="rounded-xl border border-black/10 px-3 py-2 text-sm"
                dir="ltr"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-neutral-500">SEO description</label>
              <textarea
                value={editor.seoDescription}
                onChange={(e) => setEditor((state) => ({ ...state, seoDescription: e.target.value }))}
                className="min-h-24 rounded-xl border border-black/10 px-3 py-2 text-sm leading-7"
                rows={3}
                dir="ltr"
              />
            </div>

            <div className="pt-2">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className={`h-4 w-4 ${adminIconClassName}`} aria-hidden />
                <h4 className="text-lg font-medium">محتوى المقال</h4>
              </div>
              <BlogBlockEditor blocks={editor.content} onChange={(next) => setEditor((state) => ({ ...state, content: next }))} />
            </div>

            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => savePost(false)}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                حفظ
              </button>
              <button
                type="button"
                onClick={() => savePost(true)}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#b63a6b] px-4 py-2 text-sm text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
              >
                <Eye className="h-4 w-4" aria-hidden />
                {editor.status === "published" ? "تحديث ونشر" : "نشر الآن"}
              </button>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-neutral-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>

        <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
      </aside>
    </>
  ) : null;

  return (
    <div dir="rtl" style={sans} className="relative">
      {panel}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-medium text-neutral-900">المدونة</h2>
          <p className="mt-1 text-sm text-neutral-500">إدارة المقالات المنشورة والمسودات.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b63a6b] px-4 py-2 text-sm text-white transition-[filter] hover:brightness-110"
        >
          <Plus className="h-4 w-4" aria-hidden />
          إضافة مقال
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-black/10 bg-white p-12 text-center text-neutral-500">
          لا توجد مقالات بعد.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post._id}
              className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.05)]"
            >
              <div className="relative aspect-[4/3] bg-[#f7eef2]">
                {post.coverImage ? (
                  <SafeImage
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(182,58,107,0.16),_transparent_38%),linear-gradient(135deg,#faeff6_0%,#f7f0ea_100%)]" />
                )}
                <div className="absolute end-3 top-3 rounded-full px-3 py-1 text-[11px] font-medium ring-1 ring-inset">
                  <span className={statusClasses(post.status)}>{post.status === "published" ? "منشور" : "مسودة"}</span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-black/5 px-3 py-1 text-[11px] text-neutral-600">
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="mt-4 text-lg font-semibold leading-snug text-neutral-950">{post.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-neutral-600">{post.excerpt}</p>

                <div className="mt-4 flex items-center justify-between gap-4 text-xs text-neutral-500">
                  <span>{post.authorName}</span>
                  <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs hover:bg-neutral-50"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublish(post)}
                    disabled={busyId === post._id}
                    className="inline-flex items-center gap-2 rounded-full bg-[#b63a6b] px-3 py-2 text-xs text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
                  >
                    {busyId === post._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : null}
                    {post.status === "published" ? "إلغاء النشر" : "نشر"}
                  </button>
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs hover:bg-neutral-50"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    عرض
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(post._id)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    حذف
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteConfirmId !== null}
        title="حذف المقال"
        message="هل تريدين حذف هذا المقال نهائيًا؟ لن يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={deletePost}
        onCancel={() => {
          if (!deleting) setDeleteConfirmId(null);
        }}
        busy={deleting}
      />
    </div>
  );
}
