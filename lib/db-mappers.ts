export type UserRow = {
  id: string;
  username: string;
  password?: string;
  role: string;
  email: string;
  full_name: string;
  address: string;
  phone: string;
  disabled: boolean;
  created_at: string;
  updated_at: string;
};

export function mapUserPublic(row: UserRow) {
  return {
    _id: row.id,
    username: row.username,
    email: row.email,
    fullName: row.full_name,
    address: row.address,
    phone: row.phone,
    disabled: row.disabled,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  story: string;
  material: string;
  quality: string;
  created_at: string;
  updated_at: string;
};

export function mapCollection(row: CollectionRow) {
  return {
    _id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image,
    description: row.description,
    story: row.story,
    material: row.material,
    quality: row.quality,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type ProductRow = {
  id: string;
  name: string;
  price: string;
  category?: string | null;
  category_id?: string | null;
  image: string;
  slug?: string | null;
  old_riyal?: number | null;
  sizes?: unknown;
  description_ar?: string | null;
  ingredients_ar?: string | null;
  usage_ar?: string | null;
  free_from_ar?: string | null;
  warning_ar?: string | null;
  contents_ar?: string | null;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
  col_id?: string | null;
  col_name?: string | null;
  col_slug?: string | null;
  cat_id?: string | null;
  cat_name?: string | null;
};

export function mapProduct(row: ProductRow, populated = false) {
  const sizes = Array.isArray(row.sizes)
    ? row.sizes
        .map((size) => {
          if (!size || typeof size !== "object") return null;
          const raw = size as Record<string, unknown>;
          const label = typeof raw.label === "string" ? raw.label.trim() : "";
          const sarPrice = Number(raw.sarPrice);
          const oldRiyal = Number(raw.oldRiyal);
          if (!label || Number.isNaN(sarPrice) || Number.isNaN(oldRiyal)) return null;
          return { label, sarPrice, oldRiyal };
        })
        .filter(Boolean)
    : null;
  const base = {
    _id: row.id,
    name: row.name,
    price: row.price,
    category: row.cat_name ?? row.category ?? "",
    categoryId: row.cat_id ?? row.category_id ?? null,
    image: row.image,
    slug: row.slug ?? row.id,
    oldRiyal: row.old_riyal == null ? null : Number(row.old_riyal),
    sizes,
    descriptionAr: row.description_ar ?? null,
    ingredientsAr: row.ingredients_ar ?? null,
    usageAr: row.usage_ar ?? null,
    freeFromAr: row.free_from_ar ?? null,
    warningAr: row.warning_ar ?? null,
    contentsAr: row.contents_ar ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (!populated) {
    return {
      ...base,
      collection: row.collection_id,
    };
  }
  const colId = row.col_id ?? null;
  return {
    ...base,
    collection:
      colId && row.col_name != null && row.col_slug != null
        ? { _id: colId, name: row.col_name, slug: row.col_slug }
        : null,
  };
}

export type OrderRow = {
  id: string;
  customer_id: string;
  items: unknown;
  total: number;
  status: string;
  shipping_address: unknown;
  payment_proof_url?: string | null;
  branch_key?: string | null;
  tracking_number: string;
  carrier: string;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
  customer_username?: string | null;
  customer_email?: string | null;
  customer_full_name?: string | null;
  customer_address?: string | null;
  customer_phone?: string | null;
};

function orderCommon(row: OrderRow) {
  const items = Array.isArray(row.items) ? row.items : [];
  const shippingAddress =
    row.shipping_address && typeof row.shipping_address === "object"
      ? row.shipping_address
      : {};
  const sa = shippingAddress as Record<string, unknown>;
  const branchFromCol = row.branch_key != null && String(row.branch_key).trim() !== "";
  const branchKey = branchFromCol
    ? String(row.branch_key)
    : typeof sa.branchKey === "string" && sa.branchKey.trim()
      ? sa.branchKey.trim()
      : null;
  const proofFromCol =
    row.payment_proof_url != null && String(row.payment_proof_url).trim() !== "";
  const paymentProofUrl = proofFromCol
    ? String(row.payment_proof_url)
    : typeof sa.paymentProofUrl === "string" && sa.paymentProofUrl.trim()
      ? sa.paymentProofUrl.trim()
      : null;
  return {
    _id: row.id,
    items,
    total: row.total,
    status: row.status,
    shippingAddress,
    paymentProofUrl,
    branchKey,
    trackingNumber: row.tracking_number,
    carrier: row.carrier,
    shippedAt: row.shipped_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Admin order list: customer has username, email, fullName */
export function mapOrderAdminList(row: OrderRow) {
  return {
    ...orderCommon(row),
    customer: {
      _id: row.customer_id,
      username: row.customer_username ?? "",
      email: row.customer_email ?? "",
      fullName: row.customer_full_name ?? "",
    },
  };
}

/** Admin order detail / PATCH response: customer includes address and phone */
export function mapOrderAdminDetail(row: OrderRow) {
  return {
    ...orderCommon(row),
    customer: {
      _id: row.customer_id,
      username: row.customer_username ?? "",
      email: row.customer_email ?? "",
      fullName: row.customer_full_name ?? "",
      address: row.customer_address ?? "",
      phone: row.customer_phone ?? "",
    },
  };
}
