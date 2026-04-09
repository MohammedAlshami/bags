import { sans } from "@/lib/page-theme";

const pulse = "animate-pulse rounded-sm bg-neutral-200/80";

export function AdminSkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`${pulse} ${className}`} aria-hidden />;
}

export function AdminSkeletonProductsGrid({ count = 8 }: { count?: number }) {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4 md:gap-6" aria-busy="true" aria-label="جاري التحميل">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <div className={`relative aspect-[3/5] w-full overflow-hidden rounded-2xl ${pulse}`} />
          <div className="mt-4 flex flex-col items-center gap-2">
            <AdminSkeletonLine className="h-3 w-16" />
            <AdminSkeletonLine className="h-4 w-[85%] max-w-[12rem]" />
            <AdminSkeletonLine className="h-4 w-20" />
            <AdminSkeletonLine className="h-3 w-24" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminSkeletonPageHeader() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className={`h-8 w-36 ${pulse}`} />
      <div className={`h-10 w-32 ${pulse}`} />
    </div>
  );
}

type TableCols = { key: string; widthClass?: string }[];

export function AdminSkeletonDataTable({
  columns,
  rows = 8,
  tableMinWidthClass = "min-w-[40rem]",
}: {
  columns: TableCols;
  rows?: number;
  tableMinWidthClass?: string;
}) {
  return (
    <div className="rounded-sm border border-black/10 bg-white" aria-busy="true" aria-label="جاري التحميل">
      <div className="overflow-x-auto overscroll-x-contain">
        <table className={`w-full ${tableMinWidthClass} text-sm`}>
          <thead>
            <tr className="border-b border-black/10 text-right">
              {columns.map((c) => (
                <th key={c.key} className="p-4 font-medium">
                  <div className={`h-3 ${c.widthClass ?? "w-20"} ${pulse}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, ri) => (
              <tr key={ri} className="border-b border-black/5 bg-white">
                {columns.map((c) => (
                  <td key={c.key} className="p-4">
                    <div className={`h-4 ${c.widthClass ?? "w-24 max-w-full"} ${pulse}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminSkeletonCustomersPage() {
  return (
    <div dir="rtl" style={sans}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className={`h-8 w-28 ${pulse}`} />
        <div className="flex flex-wrap gap-2">
          <div className={`h-10 w-28 ${pulse}`} />
          <div className={`h-10 w-48 ${pulse}`} />
          <div className={`h-10 w-24 ${pulse}`} />
          <div className={`h-10 w-32 ${pulse}`} />
        </div>
      </div>
      <AdminSkeletonDataTable
        tableMinWidthClass="min-w-[56rem]"
        rows={8}
        columns={[
          { key: "a", widthClass: "w-24" },
          { key: "b", widthClass: "w-32" },
          { key: "c", widthClass: "w-28" },
          { key: "d", widthClass: "w-24" },
          { key: "e", widthClass: "w-36" },
          { key: "f", widthClass: "w-12" },
          { key: "g", widthClass: "w-16" },
          { key: "h", widthClass: "w-20" },
        ]}
      />
    </div>
  );
}

export function AdminSkeletonOrdersPage() {
  return (
    <div dir="rtl" style={sans}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className={`h-8 w-28 ${pulse}`} />
        <div className={`h-10 w-32 ${pulse}`} />
      </div>
      <AdminSkeletonDataTable
        rows={8}
        columns={[
          { key: "a", widthClass: "w-32" },
          { key: "b", widthClass: "w-28" },
          { key: "c", widthClass: "w-24" },
          { key: "d", widthClass: "w-24" },
          { key: "e", widthClass: "w-20" },
        ]}
      />
    </div>
  );
}

export function AdminSkeletonCustomerDetailPage() {
  return (
    <div className="relative px-2 md:px-4" dir="rtl" style={sans}>
      <div className={`mb-6 h-5 w-40 ${pulse}`} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className={`mb-2 h-3 w-16 ${pulse}`} />
          <div className={`h-10 w-56 max-w-full ${pulse}`} />
        </div>
        <div className={`h-10 w-36 ${pulse}`} />
      </div>
      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <div className="rounded-sm border border-black/10 bg-white p-6 md:p-8">
          <div className={`mb-5 h-6 w-32 ${pulse}`} />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className={`mb-1 h-3 w-20 ${pulse}`} />
                <div className={`h-4 w-full max-w-xs ${pulse}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-sm border border-black/10 bg-white p-6 md:p-8">
          <div className={`mb-5 h-6 w-28 ${pulse}`} />
          <div className={`h-20 w-full ${pulse}`} />
        </div>
      </div>
      <div className="rounded-sm border border-black/10 bg-white">
        <div className={`border-b border-black/10 p-6 md:p-8`}>
          <div className={`h-6 w-40 ${pulse}`} />
        </div>
        <AdminSkeletonDataTable
          rows={4}
          columns={[
            { key: "a", widthClass: "w-28" },
            { key: "b", widthClass: "w-24" },
            { key: "c", widthClass: "w-20" },
            { key: "d", widthClass: "w-24" },
          ]}
        />
      </div>
    </div>
  );
}

export function AdminSkeletonOrderDetailPage() {
  return (
    <div className="px-2 md:px-4" dir="rtl" style={sans}>
      <div className={`mb-6 h-5 w-44 ${pulse}`} />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className={`mb-2 h-3 w-20 ${pulse}`} />
          <div className={`h-9 w-48 max-w-full ${pulse}`} />
        </div>
        <div className={`h-10 w-40 ${pulse}`} />
      </div>
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-sm border border-black/10 bg-white p-6">
            <div className={`mb-4 h-5 w-32 ${pulse}`} />
            <div className={`h-16 w-full ${pulse}`} />
          </div>
        ))}
      </div>
      <div className="rounded-sm border border-black/10 bg-white">
        <div className="border-b border-black/10 p-4 md:p-6">
          <div className={`h-5 w-36 ${pulse}`} />
        </div>
        <AdminSkeletonDataTable
          rows={4}
          columns={[
            { key: "a", widthClass: "w-16" },
            { key: "b", widthClass: "w-28" },
            { key: "c", widthClass: "w-20" },
            { key: "d", widthClass: "w-12" },
          ]}
        />
      </div>
    </div>
  );
}

export function AdminSkeletonShippingPage() {
  return (
    <div className="px-2 md:px-4" dir="rtl" style={sans}>
      <div className={`mb-2 h-3 w-16 ${pulse}`} />
      <div className={`mb-2 h-10 w-48 ${pulse}`} />
      <div className={`mb-6 h-4 w-full max-w-xl ${pulse}`} />
      <AdminSkeletonDataTable
        rows={6}
        columns={[
          { key: "a", widthClass: "w-16" },
          { key: "b", widthClass: "w-28" },
          { key: "c", widthClass: "w-24" },
          { key: "d", widthClass: "w-24" },
          { key: "e", widthClass: "w-24" },
          { key: "f", widthClass: "w-28" },
          { key: "g", widthClass: "w-24" },
        ]}
      />
    </div>
  );
}

export function AdminSkeletonFormFields({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="جاري التحميل">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <div className={`mb-1 h-3 w-28 ${pulse}`} />
          <div className={`h-10 w-full ${pulse}`} />
        </div>
      ))}
    </div>
  );
}

export function AdminRouteLoading() {
  return (
    <div className="space-y-8 animate-pulse" dir="rtl" style={sans} aria-busy="true" aria-label="جاري التحميل">
      <div>
        <div className={`mb-2 h-3 w-24 ${pulse}`} />
        <div className={`h-10 w-48 max-w-full ${pulse}`} />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`h-28 rounded-sm border border-black/10 ${pulse} bg-neutral-100/90`} />
        ))}
      </div>
      <div className={`h-72 rounded-sm border border-black/10 ${pulse} bg-neutral-100/90`} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className={`h-40 rounded-sm border border-black/10 ${pulse} bg-neutral-100/90`} />
        <div className={`h-40 rounded-sm border border-black/10 ${pulse} bg-neutral-100/90`} />
      </div>
    </div>
  );
}
