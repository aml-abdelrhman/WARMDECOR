"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Plus, Pencil, Trash2, Search,
  ToggleLeft, ToggleRight, X, Loader2,
  Package, ChevronUp, ChevronDown,
} from "lucide-react";

import { useAdminStore, type AdminProduct } from "@/store/admin.store";
import { formatPrice, cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const ProductSchema = z.object({
  title:               z.string().min(3,  "Title must be at least 3 characters"),
  price:               z.coerce.number().positive("Price must be positive").pipe(z.number()),
  priceAfterDiscount:  z.coerce.number().optional().pipe(z.number().optional()),
  quantity:            z.coerce.number().int().min(0, "Quantity cannot be negative").pipe(z.number()),
  category:            z.string().min(2,  "Category is required"),
  brand:               z.string().min(1,  "Brand is required"),
  active:              z.boolean(),
});

type ProductFormData = z.infer<typeof ProductSchema>;

type SortField = "title" | "price" | "quantity" | "sold";
type SortDir   = "asc" | "desc";

// ─── Modal ────────────────────────────────────────────────────────────────────

function ProductModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: AdminProduct;
  onSave:  (data: ProductFormData) => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial;

 const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<ProductFormData>({
  resolver: zodResolver(ProductSchema),
  defaultValues: initial
    ? {
        title: initial.title,
        price: initial.price,
        priceAfterDiscount: initial.priceAfterDiscount,
        quantity: initial.quantity,
        category: initial.category,
        brand: initial.brand,
        active: initial.active,
      }
    : { active: true, quantity: 0 },
});

const onSubmit: SubmitHandler<ProductFormData> = (data) => {
  setSaving(true);
  setTimeout(() => {
    onSave(data);
    setSaving(false);
    toast.success(isEdit ? "Product updated!" : "Product added!");
    onClose();
  }, 400);
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface rounded-3xl shadow-hard border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <h2 className="font-display text-lg font-bold text-ink">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-4">

          {/* Title */}
          <Field label="Product Title" error={errors.title?.message}>
            <input
              {...register("title")}
              placeholder="e.g. Apple MacBook Pro 14"
              className={inputCls(!!errors.title)}
            />
          </Field>

          {/* Price row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (EGP)" error={errors.price?.message}>
              <input
                type="number"
                min={0}
                {...register("price")}
                placeholder="0"
                className={inputCls(!!errors.price)}
              />
            </Field>
            <Field label="Discounted Price" error={errors.priceAfterDiscount?.message}>
              <input
                type="number"
                min={0}
                {...register("priceAfterDiscount")}
                placeholder="Optional"
                className={inputCls(!!errors.priceAfterDiscount)}
              />
            </Field>
          </div>

          {/* Qty + Category */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity" error={errors.quantity?.message}>
              <input
                type="number"
                min={0}
                {...register("quantity")}
                placeholder="0"
                className={inputCls(!!errors.quantity)}
              />
            </Field>
            <Field label="Category" error={errors.category?.message}>
              <input
                {...register("category")}
                placeholder="e.g. Electronics"
                className={inputCls(!!errors.category)}
              />
            </Field>
          </div>

          {/* Brand */}
          <Field label="Brand" error={errors.brand?.message}>
            <input
              {...register("brand")}
              placeholder="e.g. Apple"
              className={inputCls(!!errors.brand)}
            />
          </Field>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-secondary border border-border">
            <span className="text-sm font-medium text-ink">Active listing</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register("active")} className="sr-only peer" />
              <div className="w-10 h-5 bg-border peer-checked:bg-brand-500 rounded-full transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-ink-secondary hover:bg-surface-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-brand hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : isEdit ? "Update Product" : "Add Product"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  title,
  onConfirm,
  onClose,
}: {
  title:     string;
  onConfirm: () => void;
  onClose:   () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-3xl shadow-hard border border-border w-full max-w-sm p-6 animate-scale-in">
        <div className="w-12 h-12 rounded-2xl bg-feedback-error-bg flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-feedback-error" />
        </div>
        <h3 className="font-display text-lg font-bold text-ink text-center mb-1">Delete product?</h3>
        <p className="text-sm text-ink-secondary text-center mb-6">
          <span className="font-semibold text-ink">&quot;{title}&quot;</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-ink-secondary hover:bg-surface-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); toast.success("Product deleted."); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-feedback-error text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const products           = useAdminStore((s) => s.products);
  const addProduct         = useAdminStore((s) => s.addProduct);
  const updateProduct      = useAdminStore((s) => s.updateProduct);
  const deleteProduct      = useAdminStore((s) => s.deleteProduct);
  const toggleProductActive = useAdminStore((s) => s.toggleProductActive);

  const [search,    setSearch]    = useState("");
  const [sortField, setSortField] = useState<SortField>("sold");
  const [sortDir,   setSortDir]   = useState<SortDir>("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState<AdminProduct | undefined>();
  const [deleting,  setDeleting]  = useState<AdminProduct | undefined>();

  // ── Filter + sort ──

  const filtered = products
    .filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function handleSave(data: ProductFormData) {
    if (editing) {
      updateProduct(editing.id, data);
    } else {
      addProduct({ ...data, imageCover: "", ratingsAverage: 0 });
    }
  }

  function openEdit(p: AdminProduct) {
    setEditing(p);
    setModalOpen(true);
  }

  function openAdd() {
    setEditing(undefined);
    setModalOpen(true);
  }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortDir === "asc"
        ? <ChevronUp className="w-3 h-3 text-brand-500" />
        : <ChevronDown className="w-3 h-3 text-brand-500" />
    ) : (
      <ChevronDown className="w-3 h-3 text-ink-disabled" />
    );

  return (
    <>
      <div className="space-y-5 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Products</h1>
            <p className="text-sm text-ink-secondary mt-0.5">
              {filtered.length} of {products.length} products
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-brand hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-ink placeholder:text-ink-disabled outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary">
                    <button className="flex items-center gap-1 hover:text-ink transition-colors" onClick={() => handleSort("title")}>
                      Product <SortIcon field="title" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-ink-secondary hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-secondary">
                    <button className="flex items-center gap-1 ml-auto hover:text-ink transition-colors" onClick={() => handleSort("price")}>
                      Price <SortIcon field="price" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-secondary hidden md:table-cell">
                    <button className="flex items-center gap-1 ml-auto hover:text-ink transition-colors" onClick={() => handleSort("quantity")}>
                      Stock <SortIcon field="quantity" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-secondary hidden md:table-cell">
                    <button className="flex items-center gap-1 ml-auto hover:text-ink transition-colors" onClick={() => handleSort("sold")}>
                      Sold <SortIcon field="sold" />
                    </button>
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-ink-secondary">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-ink-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-ink-tertiary text-sm">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-secondary transition-colors group">
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink line-clamp-1 max-w-[180px] group-hover:text-brand-600 transition-colors">
                          {p.title}
                        </div>
                        <div className="text-xs text-ink-tertiary mt-0.5">{p.brand}</div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs font-medium text-ink-secondary bg-surface-tertiary px-2 py-0.5 rounded-full border border-border">
                          {p.category}
                        </span>
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-ink">{formatPrice(p.price)}</div>
                        {p.priceAfterDiscount && (
                          <div className="text-xs text-feedback-success">
                            {formatPrice(p.priceAfterDiscount)}
                          </div>
                        )}
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className={cn(
                          "text-xs font-semibold",
                          p.quantity === 0
                            ? "text-feedback-error"
                            : p.quantity < 10
                            ? "text-feedback-warning"
                            : "text-ink"
                        )}>
                          {p.quantity}
                        </span>
                      </td>
                      {/* Sold */}
                      <td className="px-4 py-3 text-right text-ink-secondary hidden md:table-cell">
                        {p.sold}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => { toggleProductActive(p.id); toast.success(p.active ? "Product deactivated." : "Product activated."); }}
                          className="transition-transform hover:scale-110"
                          aria-label="Toggle active"
                        >
                          {p.active
                            ? <ToggleRight className="w-6 h-6 text-feedback-success" />
                            : <ToggleLeft  className="w-6 h-6 text-ink-disabled"     />
                          }
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(p)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-tertiary hover:text-brand-600 hover:bg-brand-50 transition-all"
                            aria-label="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleting(p)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-tertiary hover:text-feedback-error hover:bg-feedback-error-bg transition-all"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <ProductModal
          initial={editing}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
      {deleting && (
        <DeleteConfirm
          title={deleting.title}
          onConfirm={() => deleteProduct(deleting.id)}
          onClose={() => setDeleting(undefined)}
        />
      )}
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-feedback-error animate-fade-in">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full px-3 py-2.5 rounded-xl border bg-surface-secondary text-ink text-sm placeholder:text-ink-disabled outline-none transition-all duration-150 focus:ring-2 focus:ring-brand-400 focus:border-brand-400",
    hasError ? "border-feedback-error ring-1 ring-feedback-error" : "border-border"
  );
}