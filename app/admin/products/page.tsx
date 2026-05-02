"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { SafeImage } from "@/app/components/SafeImage";
import Link from "next/link";
import { ImagePlus, MoreVertical, PackagePlus, X } from "lucide-react";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { formatSar, parseStoredPriceToInputValue } from "@/lib/format-sar";
import { formatDualPrice } from "@/lib/price-format";
import {
  AdminSkeletonPageHeader,
  AdminSkeletonProductsGrid,
} from "@/lib/admin-skeleton";

const API_ERROR_AR: Record<string, string> = {
  Forbidden: "ØºÙŠØ± Ù…Ø³Ù…ÙˆØ­",
  "Failed to fetch products": "ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª",
  "Failed to load products": "ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª",
  "Failed to create product": "ØªØ¹Ø°Ø± Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ù†ØªØ¬",
  "Failed to update product": "ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù†ØªØ¬",
  "Failed to delete product": "ØªØ¹Ø°Ø± Ø­Ø°Ù Ø§Ù„Ù…Ù†ØªØ¬",
  "Name, price, category, and image required": "Ø§Ù„Ø§Ø³Ù… ÙˆØ§Ù„Ø³Ø¹Ø± ÙˆØ§Ù„ØªØµÙ†ÙŠÙ ÙˆØ§Ù„ØµÙˆØ±Ø© Ù…Ø·Ù„ÙˆØ¨Ø©",
  "Upload failed": "ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù",
  "Invalid id": "Ù…Ø¹Ø±Ù‘Ù ØºÙŠØ± ØµØ§Ù„Ø­",
  "Not found": "ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯",
};

function arApiError(msg: string) {
  return API_ERROR_AR[msg] ?? msg;
}

function emptyFallback(value?: string | null) {
  return value?.trim() ? value : "â€”";
}

type ProductSizeRow = { label: string; sarPrice: number; oldRiyal: number };
type SizeDraftRow = { label: string; sarPrice: string; oldRiyal: string };
type SizeMode = "single" | "multiple";
type CategoryRow = { _id: string; name: string; sortOrder: number; productCount?: number };
type ProductRow = {
  _id: string;
  name: string;
  price: string;
  category: string;
  categoryId?: string | null;
  image: string;
  oldRiyal?: number | null;
  beforeDiscountPrice?: string | null;
  beforeDiscountOldRiyal?: number | null;
  sizes?: ProductSizeRow[] | null;
  descriptionAr?: string | null;
  ingredientsAr?: string | null;
  usageAr?: string | null;
  freeFromAr?: string | null;
  warningAr?: string | null;
  contentsAr?: string | null;
};

async function parseProductPage(res: Response): Promise<{
  items: ProductRow[];
  nextOffset: number | null;
}> {
  const d = await res.json().catch(() => ({}));
  if (!res.ok) {
    const raw = typeof (d as { error?: string }).error === "string" ? (d as { error: string }).error : "";
    throw new Error(raw || "Failed to load products");
  }
  const data = d as { items?: unknown; nextOffset?: unknown };
  if (!data || !Array.isArray(data.items)) {
    throw new Error("Failed to load products");
  }
  return {
    items: data.items as ProductRow[],
    nextOffset: typeof data.nextOffset === "number" ? data.nextOffset : null,
  };
}

function CategoryPicker({
  categories,
  value,
  onChange,
  onAdd,
  onEdit,
  onDelete,
}: {
  categories: CategoryRow[];
  value: string;
  onChange: (id: string) => void;
  onAdd: () => void;
  onEdit: (category: CategoryRow) => void;
  onDelete: (category: CategoryRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const selected = categories.find((category) => category._id === value) ?? null;

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-sm border border-neutral-200 bg-white px-3 py-2 text-right text-sm"
      >
        <span className={selected ? "text-neutral-900" : "text-neutral-400"}>{selected?.name ?? "Ø§Ø®ØªØ± Ø§Ù„ØªØµÙ†ÙŠÙ"}</span>
        <span className="text-neutral-400" aria-hidden>â–¾</span>
      </button>
      {open ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/5 px-3 py-2">
            <span className="text-xs font-medium text-neutral-500">Ø§Ù„ØªØµÙ†ÙŠÙØ§Øª</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onAdd();
              }}
              className="rounded-full bg-[#B63A6B] px-3 py-1 text-xs text-white"
            >
              Ø¥Ø¶Ø§ÙØ©
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category._id}
                className={[
                  "flex items-center justify-between gap-2 border-b border-black/5 px-3 py-2 last:border-b-0",
                  category._id === value ? "bg-neutral-50" : "bg-white",
                ].join(" ")}
              >
                <button
                  type="button"
                  className="flex-1 text-right text-sm text-neutral-900"
                  onClick={() => {
                    onChange(category._id);
                    setOpen(false);
                  }}
                >
                  {category.name}
                  {category.productCount != null ? <span className="ms-2 text-xs text-neutral-400">({category.productCount})</span> : null}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                    onClick={() => {
                      setOpen(false);
                      onEdit(category);
                    }}
                  >
                    ØªØ¹Ø¯ÙŠÙ„
                  </button>
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setOpen(false);
                      onDelete(category);
                    }}
                  >
                    Ø­Ø°Ù
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldRiyal, setOldRiyal] = useState("");
  const [beforeDiscountPrice, setBeforeDiscountPrice] = useState("");
  const [beforeDiscountOldRiyal, setBeforeDiscountOldRiyal] = useState("");
  const [sizeMode, setSizeMode] = useState<SizeMode>("single");
  const [sizeRows, setSizeRows] = useState<SizeDraftRow[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [ingredientsAr, setIngredientsAr] = useState("");
  const [usageAr, setUsageAr] = useState("");
  const [freeFromAr, setFreeFromAr] = useState("");
  const [warningAr, setWarningAr] = useState("");
  const [contentsAr, setContentsAr] = useState("");
  const [image, setImage] = useState("");
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [categoryEditorId, setCategoryEditorId] = useState<string | null>(null);
  const [categoryEditorName, setCategoryEditorName] = useState("");
  const [categoryEditorBusy, setCategoryEditorBusy] = useState(false);
  const [categoryDeleteConfirm, setCategoryDeleteConfirm] = useState<CategoryRow | null>(null);
  const [categoryDeleteBusy, setCategoryDeleteBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductRow | null>(null);
  const [imageDropActive, setImageDropActive] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreInFlightRef = useRef(false);

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    if (!res.ok) return [];
    return res.json();
  };

  const loadFirstProductPage = async () => {
    const res = await fetch("/api/admin/products?limit=8&offset=0");
    return parseProductPage(res);
  };

  useEffect(() => {
    let cancelled = false;
    setInitialLoading(true);
    Promise.all([loadFirstProductPage(), fetchCategories()])
      .then(([page, cats]) => {
        if (cancelled) return;
        setProducts(page.items);
        setNextOffset(page.nextOffset);
        setCategories(cats);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? arApiError(e.message) : "Ø®Ø·Ø£");
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (nextOffset === null || loadingMore || initialLoading || loadMoreInFlightRef.current) return;
    loadMoreInFlightRef.current = true;
    setLoadingMore(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products?limit=8&offset=${nextOffset}`);
      const page = await parseProductPage(res);
      setProducts((prev) => [...prev, ...page.items]);
      setNextOffset(page.nextOffset);
    } catch (e) {
      setError(e instanceof Error ? arApiError(e.message) : "Ø®Ø·Ø£");
    } finally {
      loadMoreInFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [nextOffset, loadingMore, initialLoading]);

  useEffect(() => {
    const el = loadMoreSentinelRef.current;
    if (!el || nextOffset === null || initialLoading) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingMore) return;
        void loadMore();
      },
      { root: null, rootMargin: "240px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [nextOffset, loadingMore, initialLoading, loadMore]);

  useEffect(() => {
    if (!showForm && !detailProduct) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (detailProduct) setDetailProduct(null);
      else setShowForm(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [showForm, detailProduct]);

  useEffect(() => {
    if (menuOpenId == null) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpenId]);

  const openCreate = () => {
    setDetailProduct(null);
    setEditing(null);
    setName("");
    setPrice("");
    setOldRiyal("");
    setBeforeDiscountPrice("");
    setBeforeDiscountOldRiyal("");
    setSizeMode("single");
    setSizeRows([]);
    setCategoryId(categories[0]?._id ?? "");
    setDescriptionAr("");
    setIngredientsAr("");
    setUsageAr("");
    setFreeFromAr("");
    setWarningAr("");
    setContentsAr("");
    setImage("");
    setShowForm(true);
  };

  const openEdit = (p: ProductRow) => {
    setDetailProduct(null);
    setEditing(p);
    setName(p.name);
    const existingSizes = Array.isArray(p.sizes) ? p.sizes : [];
    if (existingSizes.length > 1) {
      setSizeMode("multiple");
      setSizeRows(
        existingSizes.map((size) => ({
          label: size.label,
          sarPrice: String(size.sarPrice),
          oldRiyal: String(size.oldRiyal),
        }))
      );
      setPrice("");
      setOldRiyal("");
    } else {
      setSizeMode("single");
      setSizeRows([]);
      const firstSize = existingSizes[0] ?? null;
      setPrice(firstSize ? String(firstSize.sarPrice) : parseStoredPriceToInputValue(p.price));
      setOldRiyal(firstSize ? String(firstSize.oldRiyal) : p.oldRiyal == null ? "" : String(p.oldRiyal));
    }
    setBeforeDiscountPrice(p.beforeDiscountPrice ? parseStoredPriceToInputValue(p.beforeDiscountPrice) : "");
    setBeforeDiscountOldRiyal(p.beforeDiscountOldRiyal == null ? "" : String(p.beforeDiscountOldRiyal));
    setCategoryId(p.categoryId ?? categories[0]?._id ?? "");
    setDescriptionAr(p.descriptionAr ?? "");
    setIngredientsAr(p.ingredientsAr ?? "");
    setUsageAr(p.usageAr ?? "");
    setFreeFromAr(p.freeFromAr ?? "");
    setWarningAr(p.warningAr ?? "");
    setContentsAr(p.contentsAr ?? "");
    setImage(p.image);
    setShowForm(true);
    setMenuOpenId(null);
  };

  const updateSizeRow = (index: number, patch: Partial<SizeDraftRow>) => {
    setSizeRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addSizeRow = () => {
    setSizeRows((prev) => [...prev, { label: "", sarPrice: "", oldRiyal: "" }]);
  };

  const removeSizeRow = (index: number) => {
    setSizeRows((prev) => prev.filter((_, i) => i !== index));
  };

  const setSizeModeAndAdapt = (mode: SizeMode) => {
    if (mode === sizeMode) return;
    if (mode === "multiple") {
      setSizeRows((prev) => {
        if (prev.length > 0) return prev;
        if (price.trim() || oldRiyal.trim()) {
          return [{ label: "", sarPrice: price.trim(), oldRiyal: oldRiyal.trim() }];
        }
        return [{ label: "", sarPrice: "", oldRiyal: "" }];
      });
    } else {
      const first = sizeRows[0];
      if (first) {
        setPrice(first.sarPrice);
        setOldRiyal(first.oldRiyal);
      }
      setSizeRows([]);
    }
    setSizeMode(mode);
  };


  const refreshCategories = async () => {
    const cats = await fetchCategories();
    setCategories(cats);
    return cats as CategoryRow[];
  };

  const openCategoryCreate = () => {
    setCategoryEditorId(null);
    setCategoryEditorName("");
    setCategoryEditorOpen(true);
  };

  const openCategoryEdit = (category: CategoryRow) => {
    setCategoryEditorId(category._id);
    setCategoryEditorName(category.name);
    setCategoryEditorOpen(true);
  };

  const saveCategory = async () => {
    setCategoryEditorBusy(true);
    try {
      const name = categoryEditorName.trim();
      if (!name) {
        setError("Ø§Ø³Ù… Ø§Ù„ØªØµÙ†ÙŠÙ Ù…Ø·Ù„ÙˆØ¨.");
        return;
      }
      const url = categoryEditorId ? '/api/admin/categories/' + categoryEditorId : '/api/admin/categories';
      const method = categoryEditorId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === 'string' ? d.error : '';
        throw new Error(raw || 'Failed to create category');
      }
      const cats = await refreshCategories();
      if (categoryEditorId === null) {
        setCategoryId((current) => current || cats[0]?._id || '');
      }
      setCategoryEditorOpen(false);
      setError(null);
    } catch (e) {
      setError(arApiError(e instanceof Error ? e.message : "Ø®Ø·Ø£"));
    } finally {
      setCategoryEditorBusy(false);
    }
  };

  const deleteCategory = async () => {
    if (!categoryDeleteConfirm) return;
    setCategoryDeleteBusy(true);
    try {
      const res = await fetch('/api/admin/categories/' + categoryDeleteConfirm._id, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === 'string' ? d.error : '';
        throw new Error(raw || 'Failed to delete category');
      }
      const cats = await refreshCategories();
      if (categoryId === categoryDeleteConfirm._id) setCategoryId(cats[0]?._id ?? '');
      setCategoryDeleteConfirm(null);
      setError(null);
    } catch (e) {
      setError(arApiError(e instanceof Error ? e.message : "Ø®Ø·Ø£"));
    } finally {
      setCategoryDeleteBusy(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      let priceNum: number;
      let oldRiyalNum: number | null;
      let sizes: ProductSizeRow[] | null = null;

      if (sizeMode === "single") {
        const priceTrim = price.trim();
        if (!priceTrim) {
          setError("Ø§Ù„Ø³Ø¹Ø± Ù…Ø·Ù„ÙˆØ¨.");
          return;
        }
        priceNum = Number(priceTrim);
        if (!Number.isFinite(priceNum) || priceNum < 0) {
          setError("Ø£Ø¯Ø®Ù„ Ø³Ø¹Ø±Ø§Ù‹ ØµØ§Ù„Ø­Ø§Ù‹ Ø¨Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠ.");
          return;
        }
        const oldRiyalTrim = oldRiyal.trim();
        const parsedOldRiyal = oldRiyalTrim ? Number(oldRiyalTrim) : null;
        if (parsedOldRiyal !== null && (!Number.isFinite(parsedOldRiyal) || parsedOldRiyal < 0)) {
          setError("Ø£Ø¯Ø®Ù„ Ø³Ø¹Ø±Ø§Ù‹ ØµØ§Ù„Ø­Ø§Ù‹ Ø¨Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„ÙŠÙ…Ù†ÙŠ Ø§Ù„Ù‚Ø¯ÙŠÙ….");
          return;
        }
        oldRiyalNum = parsedOldRiyal;
      } else {
        const normalized: ProductSizeRow[] = [];
        for (const row of sizeRows) {
          const label = row.label.trim();
          const sarPrice = Number(row.sarPrice.trim());
          const oldPrice = Number(row.oldRiyal.trim());
          if (!label || !row.sarPrice.trim() || !row.oldRiyal.trim()) {
            setError("Ø£ÙƒÙ…Ù„ Ø§Ø³Ù… Ø§Ù„Ù…Ù‚Ø§Ø³ ÙˆØ§Ù„Ø³Ø¹Ø±ÙŠÙ† Ù„ÙƒÙ„ Ù…Ù‚Ø§Ø³.");
            return;
          }
          if (!Number.isFinite(sarPrice) || sarPrice < 0 || !Number.isFinite(oldPrice) || oldPrice < 0) {
            setError("Ø£Ø¯Ø®Ù„ Ø£Ø³Ø¹Ø§Ø±Ø§Ù‹ ØµØ§Ù„Ø­Ø© Ù„ÙƒÙ„ Ù…Ù‚Ø§Ø³.");
            return;
          }
          normalized.push({ label, sarPrice, oldRiyal: oldPrice });
        }
        if (normalized.length === 0) {
          setError("Ø£Ø¶Ù Ù…Ù‚Ø§Ø³Ø§Ù‹ ÙˆØ§Ø­Ø¯Ø§Ù‹ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.");
          return;
        }
        sizes = normalized;
        priceNum = normalized[0].sarPrice;
        oldRiyalNum = normalized[0].oldRiyal;
      }

      const priceFormatted = formatSar(priceNum);
      const beforeDiscountPriceValue = beforeDiscountPrice.trim() ? formatSar(Number(beforeDiscountPrice)) : null;
      const beforeDiscountOldRiyalValue = beforeDiscountOldRiyal.trim() ? Number(beforeDiscountOldRiyal) : null;
      if (beforeDiscountPrice.trim() && !Number.isFinite(Number(beforeDiscountPrice))) {
        setError("Ø£Ø¯Ø®Ù„ Ø³Ø¹Ø± Ù…Ø§ Ù‚Ø¨Ù„ Ø§Ù„Ø®ØµÙ… Ø¨Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠ Ø¨Ø´ÙƒÙ„ ØµØ­ÙŠØ­.");
        return;
      }
      if (beforeDiscountOldRiyal.trim() && !Number.isFinite(beforeDiscountOldRiyalValue)) {
        setError("Ø£Ø¯Ø®Ù„ Ø³Ø¹Ø± Ù…Ø§ Ù‚Ø¨Ù„ Ø§Ù„Ø®ØµÙ… Ø¨Ø§Ù„Ø¹Ù…Ù„Ø© Ø§Ù„Ù‚Ø¯ÙŠÙ…Ø© Ø¨Ø´ÙƒÙ„ ØµØ­ÙŠØ­.");
        return;
      }
      const url = editing ? `/api/admin/products/${editing._id}` : "/api/admin/products";
      const method = editing ? "PUT" : "POST";
      const payload = {
        name,
        price: priceFormatted,
        oldRiyal: oldRiyalNum,
        beforeDiscountPrice: beforeDiscountPriceValue,
        beforeDiscountOldRiyal: beforeDiscountOldRiyalValue,
        categoryId,
        descriptionAr: descriptionAr.trim() || null,
        ingredientsAr: ingredientsAr.trim() || null,
        usageAr: usageAr.trim() || null,
        freeFromAr: freeFromAr.trim() || null,
        warningAr: warningAr.trim() || null,
        contentsAr: contentsAr.trim() || null,
        image,
        sizes,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "ØªØ¹Ø°Ø± Ø§Ù„Ø­ÙØ¸");
      }
      setShowForm(false);
      setError(null);
      const page = await loadFirstProductPage();
      setProducts(page.items);
      setNextOffset(page.nextOffset);
    } catch (e) {
      setError(arApiError(e instanceof Error ? e.message : "Ø®Ø·Ø£"));
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "ÙØ´Ù„ Ø§Ù„Ø±ÙØ¹");
      }
      const { url } = await res.json();
      setImage(url);
    } catch (e) {
      setError(arApiError(e instanceof Error ? e.message : "ÙØ´Ù„ Ø§Ù„Ø±ÙØ¹"));
    } finally {
      setUploading(false);
    }
  };

  const onImageDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setImageDropActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadImage(f);
  };

  const onImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadImage(f);
    e.target.value = "";
  };

  const performRemove = async (id: string) => {
    setMenuOpenId(null);
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "ØªØ¹Ø°Ø± Ø§Ù„Ø­Ø°Ù");
      }
      const page = await loadFirstProductPage();
      setProducts(page.items);
      setNextOffset(page.nextOffset);
      setDeleteConfirmId(null);
      if (detailProduct?._id === id) setDetailProduct(null);
    } catch (e) {
      setError(arApiError(e instanceof Error ? e.message : "Ø®Ø·Ø£"));
    } finally {
      setDeleteBusy(false);
    }
  };

  const formFields = (
    <div className="grid gap-6">
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Ø§Ù„Ø§Ø³Ù…</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Ø§Ù„ØªØµÙ†ÙŠÙ</label>
        <CategoryPicker
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
          onAdd={openCategoryCreate}
          onEdit={openCategoryEdit}
          onDelete={(category) => setCategoryDeleteConfirm(category)}
        />
      </div>

      <section className="grid gap-4 rounded-xl border border-black/5 bg-white p-4">
        <div>
          <h4 className="text-sm font-semibold text-neutral-900">Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ù†ØªØ¬</h4>
          <p className="mt-1 text-xs text-neutral-500">Ø§Ù„ÙˆØµÙ ÙˆØ§Ù„Ù…ÙƒÙˆÙ†Ø§Øª ÙˆØ·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… ÙˆØ§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„ØªÙŠ ØªØ¸Ù‡Ø± ÙÙŠ ØµÙØ­Ø© Ø§Ù„Ù…Ù†ØªØ¬.</p>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Ø§Ù„ÙˆØµÙ</label>
          <textarea
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            className="min-h-24 w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Ø§Ù„Ù…ÙƒÙˆÙ†Ø§Øª</label>
          <textarea
            value={ingredientsAr}
            onChange={(e) => setIngredientsAr(e.target.value)}
            className="min-h-20 w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…</label>
          <textarea
            value={usageAr}
            onChange={(e) => setUsageAr(e.target.value)}
            className="min-h-20 w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Ø®Ø§Ù„ÙŠ Ù…Ù†</label>
            <textarea
              value={freeFromAr}
              onChange={(e) => setFreeFromAr(e.target.value)}
              className="min-h-20 w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">ØªØ­Ø°ÙŠØ±Ø§Øª</label>
            <textarea
              value={warningAr}
              onChange={(e) => setWarningAr(e.target.value)}
              className="min-h-20 w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Ø§Ù„Ù…Ø­ØªÙˆÙŠØ§Øª</label>
          <textarea
            value={contentsAr}
            onChange={(e) => setContentsAr(e.target.value)}
            className="min-h-20 w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-black/5 bg-neutral-50/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-neutral-900">Ø§Ù„Ù…Ù‚Ø§Ø³Ø§Øª ÙˆØ§Ù„Ø£Ø³Ø¹Ø§Ø±</h4>
            <p className="mt-1 text-xs text-neutral-500">Ø§Ù„ØªØ³Ø¹ÙŠØ± ÙŠÙƒÙˆÙ† Ù‡Ù†Ø§ ÙÙ‚Ø·ØŒ Ø¥Ù…Ø§ Ù„Ù…Ù‚Ø§Ø³ ÙˆØ§Ø­Ø¯ Ø£Ùˆ Ù„Ø¹Ø¯Ø© Ù…Ù‚Ø§Ø³Ø§Øª.</p>
          </div>
          <div className="inline-flex overflow-hidden rounded-full border border-neutral-200 bg-white p-1 text-xs">
            <button
              type="button"
              onClick={() => setSizeModeAndAdapt("single")}
              className={[
                "rounded-full px-3 py-1.5 transition-colors",
                sizeMode === "single" ? "bg-[#B63A6B] text-white" : "text-neutral-600 hover:bg-neutral-100",
              ].join(" ")}
            >
              Ù…Ù‚Ø§Ø³ ÙˆØ§Ø­Ø¯
            </button>
            <button
              type="button"
              onClick={() => setSizeModeAndAdapt("multiple")}
              className={[
                "rounded-full px-3 py-1.5 transition-colors",
                sizeMode === "multiple" ? "bg-[#B63A6B] text-white" : "text-neutral-600 hover:bg-neutral-100",
              ].join(" ")}
            >
              Ù…Ù‚Ø§Ø³Ø§Øª Ù…ØªØ¹Ø¯Ø¯Ø©
            </button>
          </div>
        </div>

        {sizeMode === "single" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Ø§Ù„Ø³Ø¹Ø± Ø¨Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠ</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
                placeholder="242.00"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Ø§Ù„Ø³Ø¹Ø± Ø¨Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„ÙŠÙ…Ù†ÙŠ Ø§Ù„Ù‚Ø¯ÙŠÙ…</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="1"
                value={oldRiyal}
                onChange={(e) => setOldRiyal(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
                placeholder="3000"
                dir="ltr"
              />
            <div>
              <label className="block text-xs text-neutral-500 mb-1">قبل الخصم - ريال سعودي</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={beforeDiscountPrice}
                onChange={(e) => setBeforeDiscountPrice(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
                placeholder="300.00"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">قبل الخصم - العملة القديمة</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="1"
                value={beforeDiscountOldRiyal}
                onChange={(e) => setBeforeDiscountOldRiyal(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
                placeholder="41000"
                dir="ltr"
              />
            </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {sizeRows.map((row, index) => (
              <div key={index} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-neutral-900">Ù…Ù‚Ø§Ø³ {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeSizeRow(index)}
                    className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40"
                    disabled={sizeRows.length === 1}
                  >
                    Ø­Ø°Ù
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Ø§Ù„Ø§Ø³Ù…</label>
                    <input
                      value={row.label}
                      onChange={(e) => updateSizeRow(index, { label: e.target.value })}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
                      placeholder="200ml"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Ø§Ù„Ø³Ø¹Ø± Ø¨Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠ</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={row.sarPrice}
                      onChange={(e) => updateSizeRow(index, { sarPrice: e.target.value })}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
                      placeholder="15.00"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Ø§Ù„Ø³Ø¹Ø± Ø¨Ø§Ù„Ø±ÙŠØ§Ù„ Ø§Ù„ÙŠÙ…Ù†ÙŠ Ø§Ù„Ù‚Ø¯ÙŠÙ…</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="1"
                      value={row.oldRiyal}
                      onChange={(e) => updateSizeRow(index, { oldRiyal: e.target.value })}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
                      placeholder="2000"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addSizeRow}
              className="w-fit rounded-full border border-[#B63A6B] px-4 py-2 text-sm text-[#B63A6B] hover:bg-[#B63A6B] hover:text-white"
            >
              + Ø¥Ø¶Ø§ÙØ© Ù…Ù‚Ø§Ø³
            </button>
          </div>
        )}
      </section>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">Ø§Ù„ØµÙˆØ±Ø©</label>
        <input
          ref={imageFileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-hidden
          tabIndex={-1}
          disabled={uploading}
          onChange={onImageFileChange}
        />
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              imageFileInputRef.current?.click();
            }
          }}
          onClick={() => !uploading && imageFileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!uploading) setImageDropActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setImageDropActive(false);
          }}
          onDrop={onImageDrop}
          className={[
            "relative rounded-xl border-2 border-dashed transition-colors min-h-[168px] flex flex-col items-center justify-center text-center px-4 py-6 cursor-pointer select-none",
            uploading ? "border-neutral-200 bg-white opacity-70 pointer-events-none" : "",
            !uploading && imageDropActive ? "border-black bg-white" : "",
            !uploading && !imageDropActive ? "border-neutral-200 bg-white hover:border-neutral-400" : "",
          ].join(" ")}
        >
          {uploading ? (
            <p className="text-sm text-neutral-600" style={sans}>
              Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø±ÙØ¹â€¦
            </p>
          ) : image ? (
            <div className="relative w-full max-w-[240px] mx-auto">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-black/10 bg-neutral-100">
                <SafeImage src={image} alt="" fill className="object-contain" sizes="240px" />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  className="text-xs text-neutral-600 underline hover:text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    imageFileInputRef.current?.click();
                  }}
                >
                  ØªØºÙŠÙŠØ± Ø§Ù„ØµÙˆØ±Ø©
                </button>
                <span className="text-neutral-300" aria-hidden>|</span>
                <button
                  type="button"
                  className="text-xs text-red-600 underline hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage("");
                  }}
                >
                  Ø¥Ø²Ø§Ù„Ø©
                </button>
              </div>
            </div>
          ) : (
            <>
              <ImagePlus className={`w-11 h-11 mb-3 ${adminIconClassName}`} strokeWidth={1.25} aria-hidden />
              <p className="text-sm font-medium text-neutral-800" style={sans}>
                Ø§Ø³Ø­Ø¨ Ø§Ù„ØµÙˆØ±Ø© Ù‡Ù†Ø§
              </p>
              <p className="text-xs text-neutral-500 mt-1">Ø£Ùˆ Ø§Ø¶ØºØ· Ù„Ø§Ø®ØªÙŠØ§Ø± Ù…Ù„Ù Ù…Ù† Ø¬Ù‡Ø§Ø²Ùƒ</p>
              <p className="text-[11px] text-neutral-400 mt-2">PNGØŒ JPGØŒ WebP</p>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter] disabled:opacity-50 disabled:hover:brightness-100"
        >
          {saving ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸â€¦" : "Ø­ÙØ¸"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 border border-black text-sm rounded-sm"
        >
          Ø¥Ù„ØºØ§Ø¡
        </button>
      </div>
    </div>
  );

  if (initialLoading) {
    return (
      <div dir="rtl" style={sans} className="relative">
        <AdminSkeletonPageHeader />
        <AdminSkeletonProductsGrid count={8} />
      </div>
    );
  }
  if (error && products.length === 0) {
    return (
      <p className="text-red-600" dir="rtl" style={sans}>
        {error}
      </p>
    );
  }

  return (
    <div dir="rtl" style={sans} className="relative">
      {error && products.length > 0 ? (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-neutral-900">Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter]"
        >
          <PackagePlus className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬
        </button>
      </div>

      {showForm && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] cursor-pointer bg-black/40 transition-colors hover:bg-black/50"
            aria-label="Ø¥ØºÙ„Ø§Ù‚"
            onClick={() => setShowForm(false)}
          />
          <aside
            className="
              fixed z-[70] flex flex-col bg-white shadow-2xl
              inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10
              md:inset-x-auto md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-l md:border-black/10
            "
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h3 className="text-lg font-medium">{editing ? "ØªØ¹Ø¯ÙŠÙ„ Ù…Ù†ØªØ¬" : "Ù…Ù†ØªØ¬ Ø¬Ø¯ÙŠØ¯"}</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 rounded-sm hover:opacity-70 text-neutral-600"
                aria-label="Ø¥ØºÙ„Ø§Ù‚"
              >
                <X className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">{formFields}</div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      )}

      {detailProduct && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] cursor-pointer bg-black/40 transition-colors hover:bg-black/50"
            aria-label="Ø¥ØºÙ„Ø§Ù‚"
            onClick={() => setDetailProduct(null)}
          />
          <aside
            className="
              fixed z-[70] flex flex-col bg-white shadow-2xl
              inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10
              md:inset-x-auto md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-l md:border-black/10
            "
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h3 className="text-lg font-medium">ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬</h3>
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="p-2 rounded-sm hover:opacity-70 text-neutral-600"
                aria-label="Ø¥ØºÙ„Ø§Ù‚"
              >
                <X className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border border-black/10">
                {detailProduct.image ? (
                  <SafeImage
                    src={detailProduct.image}
                    alt={detailProduct.name}
                    fill
                    className="object-cover object-center"
                    sizes="280px"
                  />
                ) : null}
              </div>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">Ø§Ù„Ø§Ø³Ù…</dt>
                  <dd className="font-medium text-neutral-900">{detailProduct.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">Ø§Ù„Ø³Ø¹Ø±</dt>
                  <dd className="text-neutral-900">{detailProduct.price}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">Ø§Ù„ØªØµÙ†ÙŠÙ</dt>
                  <dd className="text-neutral-900">{detailProduct.category}</dd>
                </div>
                
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">Ø§Ù„ÙˆØµÙ</dt>
                  <dd className="whitespace-pre-wrap text-neutral-900">{emptyFallback(detailProduct.descriptionAr)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">Ø§Ù„Ù…ÙƒÙˆÙ†Ø§Øª</dt>
                  <dd className="whitespace-pre-wrap text-neutral-900">{emptyFallback(detailProduct.ingredientsAr)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…</dt>
                  <dd className="whitespace-pre-wrap text-neutral-900">{emptyFallback(detailProduct.usageAr)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">Ø®Ø§Ù„ÙŠ Ù…Ù†</dt>
                  <dd className="whitespace-pre-wrap text-neutral-900">{emptyFallback(detailProduct.freeFromAr)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">ØªØ­Ø°ÙŠØ±Ø§Øª</dt>
                  <dd className="whitespace-pre-wrap text-neutral-900">{emptyFallback(detailProduct.warningAr)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">Ø§Ù„Ù…Ø­ØªÙˆÙŠØ§Øª</dt>
                  <dd className="whitespace-pre-wrap text-neutral-900">{emptyFallback(detailProduct.contentsAr)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">Ø§Ù„Ù…Ø¹Ø±Ù‘Ù</dt>
                  <dd className="font-mono text-xs text-neutral-800 break-all" dir="ltr">
                    {detailProduct._id}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  href={`/product/${detailProduct._id}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-black text-sm rounded-sm hover:bg-neutral-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ø¹Ø±Ø¶ ÙÙŠ Ø§Ù„Ù…ØªØ¬Ø±
                </Link>
                <button
                  type="button"
                  onClick={() => openEdit(detailProduct)}
                  className="px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter]"
                >
                  ØªØ¹Ø¯ÙŠÙ„
                </button>
              </div>
            </div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      )}

      {products.length === 0 ? (
        <p className="py-12 text-neutral-500 text-center border border-black/10 rounded-sm bg-white">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†ØªØ¬Ø§Øª Ø¨Ø¹Ø¯.</p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 list-none p-0 m-0">
            {products.map((p) => (
              <li key={p._id} className="relative">
                <article
                  className="group flex h-full flex-col cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setMenuOpenId(null);
                    setDetailProduct(p);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setMenuOpenId(null);
                      setDetailProduct(p);
                    }
                  }}
                >
                  <div className="relative aspect-[3/5] w-full overflow-hidden rounded-2xl">
                    {p.image && (
                      <SafeImage
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    )}
                    <div className="absolute top-2 end-2 z-[1] sm:top-3 sm:end-3" ref={menuOpenId === p._id ? menuRef : undefined}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId((id) => (id === p._id ? null : p._id));
                        }}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-black/10 bg-white/95 text-neutral-700 shadow-sm transition-shadow hover:border-black/20 hover:bg-white hover:shadow-md"
                        aria-expanded={menuOpenId === p._id}
                        aria-haspopup="menu"
                        aria-label="Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬"
                      >
                        <MoreVertical className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.5} />
                      </button>
                      {menuOpenId === p._id && (
                        <div
                          role="menu"
                          className="absolute top-full end-0 mt-1 min-w-[10rem] rounded-sm border border-black/10 bg-white py-1 shadow-lg z-[2]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            role="menuitem"
                            className="block w-full cursor-pointer text-right px-3 py-2 text-sm transition-colors hover:bg-neutral-50"
                            onClick={() => openEdit(p)}
                          >
                            ØªØ¹Ø¯ÙŠÙ„
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="block w-full cursor-pointer text-right px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                            onClick={() => {
                              setMenuOpenId(null);
                              setDeleteConfirmId(p._id);
                            }}
                          >
                            Ø­Ø°Ù
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-1 text-center">
                    <span className="text-xs text-neutral-500">{p.category}</span>
                    <span className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug">{p.name}</span>
                    <span className="text-sm text-neutral-900">{formatDualPrice(p.price, p.oldRiyal)}</span>
                    
                  </div>
                </article>
              </li>
            ))}
          </ul>
          {loadingMore ? <AdminSkeletonProductsGrid count={8} /> : null}
          <div ref={loadMoreSentinelRef} className="h-3 w-full shrink-0" aria-hidden />
        </>
      )}


      {categoryEditorOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] cursor-pointer bg-black/40 transition-colors hover:bg-black/50"
            aria-label="Ø¥ØºÙ„Ø§Ù‚"
            onClick={() => setCategoryEditorOpen(false)}
          />
          <aside
            className="fixed z-[90] flex flex-col bg-white shadow-2xl inset-x-0 bottom-0 max-h-[50vh] rounded-t-2xl border-t border-black/10 md:inset-x-auto md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-full md:max-h-none md:w-full md:max-w-lg md:rounded-none md:border-t-0 md:border-l md:border-black/10"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h3 className="text-lg font-medium">{categoryEditorId ? "ØªØ¹Ø¯ÙŠÙ„ ØªØµÙ†ÙŠÙ" : "ØªØµÙ†ÙŠÙ Ø¬Ø¯ÙŠØ¯"}</h3>
              <button
                type="button"
                onClick={() => setCategoryEditorOpen(false)}
                className="p-2 rounded-sm hover:opacity-70 text-neutral-600"
                aria-label="Ø¥ØºÙ„Ø§Ù‚"
              >
                <X className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <label className="mb-1 block text-xs text-neutral-500">Ø§Ù„Ø§Ø³Ù…</label>
              <input
                value={categoryEditorName}
                onChange={(e) => setCategoryEditorName(e.target.value)}
                className="w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveCategory}
                  disabled={categoryEditorBusy}
                  className="rounded-sm bg-[#B63A6B] px-4 py-2 text-sm text-white transition-[filter] hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
                >
                  {categoryEditorBusy ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸..." : "Ø­ÙØ¸"}
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryEditorOpen(false)}
                  className="rounded-sm border border-black px-4 py-2 text-sm"
                >
                  Ø¥Ù„ØºØ§Ø¡
                </button>
              </div>
            </div>
          </aside>
        </>
      ) : null}

      <ConfirmModal
        open={categoryDeleteConfirm !== null}
        title="Ø­Ø°Ù Ø§Ù„ØªØµÙ†ÙŠÙ"
        message="Ø³ÙŠØªÙ… Ù†Ù‚Ù„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ù‡Ø°Ø§ Ø§Ù„ØªØµÙ†ÙŠÙ Ø¥Ù„Ù‰ ØªØµÙ†ÙŠÙ Ø¢Ø®Ø± ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ù‚Ø¨Ù„ Ø§Ù„Ø­Ø°Ù."
        confirmLabel="Ø­Ø°Ù"
        cancelLabel="Ø¥Ù„ØºØ§Ø¡"
        onConfirm={() => {
          void deleteCategory();
        }}
        onCancel={() => {
          if (!categoryDeleteBusy) setCategoryDeleteConfirm(null);
        }}
        busy={categoryDeleteBusy}
      />

      <ConfirmModal
        open={deleteConfirmId !== null}
        title="Ø­Ø°Ù Ø§Ù„Ù…Ù†ØªØ¬"
        message="Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ù…Ù†ØªØ¬ØŸ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù† Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡."
        confirmLabel="Ø­Ø°Ù"
        cancelLabel="Ø¥Ù„ØºØ§Ø¡"
        onConfirm={() => {
          if (deleteConfirmId) void performRemove(deleteConfirmId);
        }}
        onCancel={() => {
          if (!deleteBusy) setDeleteConfirmId(null);
        }}
        busy={deleteBusy}
      />
    </div>
  );
}
