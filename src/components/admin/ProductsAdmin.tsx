import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Languages,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { categories, getCategory } from "@/lib/catalog";
import { formatPrice, LANGS, useI18n, type L, type Lang } from "@/lib/i18n";
import { PRODUCTS_KEY, toRow, useProducts, type Product } from "@/lib/products";
import { translateProductTexts } from "@/lib/translate.functions";
import { extFor, shrinkImage } from "@/lib/shrinkImage";

const BUCKET = "product-images";
const field =
  "mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none";
const label = "text-xs text-ivory/60";

// Uploaded photos are served by the site at /product-images/<file> (the bucket
// is private). Returns the storage path for those, or null for other images
// such as the original photos under /products/.
const IMAGE_ROUTE = "/product-images/";
const storagePath = (url: string) =>
  url.startsWith(IMAGE_ROUTE) ? url.slice(IMAGE_ROUTE.length) : null;

const removeStored = async (urls: string[]) => {
  const paths = urls.map(storagePath).filter((p): p is string => p !== null);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
};

const emptyL = (): L => ({ he: "", fr: "", en: "" });

// Hebrew first in the product form: it is the required, primary language.
const FORM_LANGS = (["he", "fr", "en"] as const).map((code) => LANGS.find((l) => l.code === code)!);

export function ProductsAdmin() {
  const { t, tl, lang } = useI18n();
  const { all, isLoading, isError } = useProducts();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shown = filter ? all.filter((p) => p.categories.includes(filter)) : all;
  const refresh = () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
  const [moving, setMoving] = useState(false);

  // Swap a product with its neighbour in the list shown, renumbering the list's
  // sort values so ties (e.g. from the original sample data) can't block a move.
  const move = async (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= shown.length) return;
    const order = [...shown];
    [order[i], order[j]] = [order[j]!, order[i]!];
    const changed = order.map((p, k) => ({ p, sort: k })).filter(({ p, sort }) => p.sort !== sort);
    setMoving(true);
    setError(null);
    const results = await Promise.all(
      changed.map(({ p, sort }) => supabase.from("products").update({ sort }).eq("id", p.id)),
    );
    setMoving(false);
    if (results.some((r) => r.error)) setError(t("saveError"));
    refresh();
  };

  const onDelete = async (p: Product) => {
    if (!window.confirm(t("confirmDelete"))) return;
    setError(null);
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return setError(t("saveError"));
    await removeStored(p.images);
    refresh();
  };

  // One-off tool: shrink photos uploaded before upload-time shrinking existed.
  // Uploads a smaller copy under a new name (old URLs are cached for a year),
  // points the product at it, then deletes the original.
  const [optimizing, setOptimizing] = useState<{ done: number; total: number } | null>(null);
  const [optimized, setOptimized] = useState<string | null>(null);
  const optimizeExisting = async () => {
    if (!window.confirm(t("optimizeConfirm"))) return;
    setError(null);
    setOptimized(null);
    let count = 0;
    let saved = 0;
    setOptimizing({ done: 0, total: all.length });
    for (const [n, p] of all.entries()) {
      const images: string[] = [];
      const added: string[] = [];
      const replaced: string[] = [];
      for (const url of p.images) {
        try {
          if (!storagePath(url)) throw new Error("not uploaded");
          const blob = await (await fetch(url)).blob();
          if (blob.size < 400_000) throw new Error("small already");
          const small = await shrinkImage(blob);
          if (small.size > blob.size * 0.8) throw new Error("no real gain");
          const path = `${crypto.randomUUID()}.${extFor(small.type)}`;
          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, small, { contentType: small.type, upsert: false });
          if (error) throw error;
          images.push(IMAGE_ROUTE + path);
          added.push(IMAGE_ROUTE + path);
          replaced.push(url);
          saved += blob.size - small.size;
        } catch {
          images.push(url);
        }
      }
      if (added.length) {
        const { error } = await supabase.from("products").update({ images }).eq("id", p.id);
        if (error) await removeStored(added);
        else {
          await removeStored(replaced);
          count += added.length;
        }
      }
      setOptimizing({ done: n + 1, total: all.length });
    }
    setOptimizing(null);
    setOptimized(
      t("optimizeDone")
        .replace("{n}", String(count))
        .replace("{mb}", (saved / 1_000_000).toFixed(1)),
    );
    refresh();
  };

  if (editing) {
    return (
      <ProductForm
        product={editing === "new" ? null : editing}
        defaultCategory={filter || categories[0]!.slug}
        nextSort={Math.max(0, ...all.map((p) => p.sort)) + 1}
        onDone={(changed) => {
          setEditing(null);
          if (changed) refresh();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`${field} mt-0 w-auto`}
        >
          <option value="" className="bg-navy-2">
            {t("allCategories")} ({all.length})
          </option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug} className="bg-navy-2">
              {tl(c.label)} ({all.filter((p) => p.categories.includes(c.slug)).length})
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={optimizeExisting}
            disabled={optimizing !== null}
            className="rounded-full border border-white/15 px-4 py-2 text-xs text-ivory transition hover:border-gold/50 hover:text-gold-2 disabled:opacity-60"
          >
            {optimizing
              ? t("optimizing")
                  .replace("{done}", String(optimizing.done))
                  .replace("{total}", String(optimizing.total))
              : t("optimizeImages")}
          </button>
          <button
            onClick={() => setEditing("new")}
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy transition hover:bg-gold-2"
          >
            + {t("addProduct")}
          </button>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {optimized && <p className="mt-3 text-sm text-emerald-300">{optimized}</p>}

      <ul className="mt-6 space-y-3">
        {isError ? (
          <li className="text-sm text-red-300">{t("loadError")}</li>
        ) : isLoading ? (
          <li className="text-sm text-ivory/50">{t("loading")}</li>
        ) : (
          shown.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
            >
              <div className="flex flex-col">
                <button
                  aria-label={t("moveUp")}
                  title={t("moveUp")}
                  disabled={i === 0 || moving}
                  onClick={() => move(i, -1)}
                  className="text-ivory/50 hover:text-gold-2 disabled:opacity-20"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  aria-label={t("moveDown")}
                  title={t("moveDown")}
                  disabled={i === shown.length - 1 || moving}
                  onClick={() => move(i, 1)}
                  className="text-ivory/50 hover:text-gold-2 disabled:opacity-20"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
              <img src={p.images[0]} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ivory">
                  {tl(p.name) || p.name.he}
                  {!p.active && (
                    <span className="ms-2 rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-ivory/50">
                      {t("hiddenBadge")}
                    </span>
                  )}
                  {!p.inStock && (
                    <span className="ms-2 rounded-full border border-red-300/40 px-2 py-0.5 text-[10px] text-red-200">
                      {t("outOfStock")}
                    </span>
                  )}
                </p>
                <p className="text-xs text-ivory/50">
                  {p.categories
                    .map((slug) => (getCategory(slug) ? tl(getCategory(slug)!.label) : slug))
                    .join(", ")}{" "}
                  · <span className="text-gold-2">{formatPrice(p.price, lang)}</span>
                </p>
              </div>
              <button
                onClick={() => setEditing(p)}
                className="text-sm text-ivory/70 hover:text-gold-2"
              >
                {t("edit")}
              </button>
              <button
                onClick={() => onDelete(p)}
                className="text-sm text-red-300/80 hover:text-red-300"
              >
                {t("delete")}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ProductForm({
  product,
  defaultCategory,
  nextSort,
  onDone,
}: {
  product: Product | null;
  defaultCategory: string;
  nextSort: number;
  onDone: (changed: boolean) => void;
}) {
  const { t, tl, dir } = useI18n();
  const [cats, setCats] = useState<string[]>(product?.categories ?? [defaultCategory]);
  const toggleCat = (slug: string) =>
    setCats((prev) => (prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]));
  const [name, setName] = useState<L>(product?.name ?? emptyL());
  const [subtitle, setSubtitle] = useState<L>(product?.subtitle ?? emptyL());
  const [description, setDescription] = useState<L>(product?.description ?? emptyL());
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [active, setActive] = useState(product?.active ?? true);
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  // Photos uploaded in this form session, removed again if the form is cancelled.
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Auto-translated languages must be ticked as reviewed before saving.
  const [review, setReview] = useState<Record<"fr" | "en", "none" | "pending" | "approved">>({
    fr: "none",
    en: "none",
  });
  const [translating, setTranslating] = useState(false);

  const translate = async () => {
    const filled = [
      name.fr,
      name.en,
      subtitle.fr,
      subtitle.en,
      description.fr,
      description.en,
    ].some((v) => v.trim());
    if (filled && !window.confirm(t("translateOverwrite"))) return;
    setTranslating(true);
    setError(null);
    try {
      const r = await translateProductTexts({
        data: { name: name.he, subtitle: subtitle.he, description: description.he },
      });
      setName({ ...name, fr: r.fr.name, en: r.en.name });
      setSubtitle({ ...subtitle, fr: r.fr.subtitle, en: r.en.subtitle });
      setDescription({ ...description, fr: r.fr.description, en: r.en.description });
      setReview({ fr: "pending", en: "pending" });
    } catch (e) {
      setError(
        t(e instanceof Error && e.message.includes("QUOTA") ? "translateQuota" : "translateError"),
      );
    } finally {
      setTranslating(false);
    }
  };

  const upload = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setError(null);
    const urls: string[] = [];
    for (const original of files) {
      const file = await shrinkImage(original);
      // Pasted screenshots are often all named "image.png"; prefer the MIME type.
      const ext = file.type
        ? extFor(file.type)
        : original.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        setError(t("uploadError"));
        continue;
      }
      urls.push(IMAGE_ROUTE + path);
    }
    setImages((prev) => [...prev, ...urls]);
    setUploaded((prev) => [...prev, ...urls]);
    setUploading(false);
  };

  // Ctrl+V / Cmd+V anywhere while the form is open adds pasted images.
  // Text pastes (into the name or description fields) are left alone.
  const uploadRef = useRef(upload);
  uploadRef.current = upload;
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (!files.length) return;
      e.preventDefault();
      uploadRef.current(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const move = (i: number, delta: number) =>
    setImages((prev) => {
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  const cancel = async () => {
    await removeStored(uploaded);
    onDone(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.he.trim()) return setError(t("hebrewRequired"));
    if (images.length === 0) return setError(t("imagesRequired"));
    if (cats.length === 0) return setError(t("categoriesRequired"));
    if (review.fr === "pending" || review.en === "pending")
      return setError(t("translateApproveFirst"));
    setBusy(true);
    setError(null);
    const row = toRow({
      // Keep the menu's category order so the primary one is predictable.
      categories: categories.map((c) => c.slug).filter((slug) => cats.includes(slug)),
      name,
      subtitle,
      description,
      price: Number(price),
      images,
      active,
      inStock,
      sort: product?.sort ?? nextSort,
    });
    const { error } = product
      ? await supabase.from("products").update(row).eq("id", product.id)
      : await supabase.from("products").insert(row);
    setBusy(false);
    if (error) return setError(t("saveError"));
    // Photos taken off the product are no longer needed in storage.
    await removeStored((product?.images ?? []).filter((u) => !images.includes(u)));
    onDone(true);
  };

  const langField = (
    key: Lang,
    value: L,
    set: (v: L) => void,
    opts: { multiline?: boolean; required?: boolean },
  ) => {
    const props = {
      value: value[key],
      required: opts.required,
      dir: key === "he" ? "rtl" : "ltr",
      onChange: (e: { target: { value: string } }) => set({ ...value, [key]: e.target.value }),
      className: field,
    } as const;
    return opts.multiline ? (
      <textarea rows={3} maxLength={2000} {...props} />
    ) : (
      <input maxLength={200} {...props} />
    );
  };

  // Previous: towards the start in reading order.
  const Prev = dir === "rtl" ? ChevronRight : ChevronLeft;
  const Next = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <h2 className="font-heb text-2xl text-ivory">
        {product ? t("editProduct") : t("addProduct")}
      </h2>

      <fieldset>
        <legend className={label}>{t("categoriesLabel")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => {
            const on = cats.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggleCat(c.slug)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  on
                    ? "border-gold bg-gold/20 text-gold-2"
                    : "border-white/15 text-ivory/60 hover:border-gold/50 hover:text-ivory"
                }`}
              >
                {on ? "✓ " : ""}
                {tl(c.label)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-4">
        <label className="block">
          <span className={label}>{t("price")}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            dir="ltr"
            className={field}
          />
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-ivory">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="size-4 accent-gold"
          />
          {t("visible")}
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-ivory">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="size-4 accent-gold"
          />
          {t("inStockLabel")}
        </label>
      </div>

      {/* One column per language; Hebrew name is the only required text. */}
      <div className="grid gap-4 lg:grid-cols-3">
        {FORM_LANGS.map((l) => (
          <fieldset key={l.code} className="space-y-3 rounded-xl border border-white/10 p-4">
            <legend className="px-1 text-xs text-gold-2">
              {l.label}
              {l.code !== "he" && !name[l.code].trim() && (
                <span className="ms-2 text-ivory/40">({t("missingTranslation")})</span>
              )}
            </legend>
            {l.code === "he" && (
              <button
                type="button"
                onClick={translate}
                disabled={!name.he.trim() || translating}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold-2 transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Languages className="size-3.5" />
                {translating ? t("translating") : t("translateToOthers")}
              </button>
            )}
            {l.code !== "he" && review[l.code] !== "none" && (
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                  review[l.code] === "approved"
                    ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
                    : "border-gold/50 bg-gold/10 text-gold-2"
                }`}
              >
                <input
                  type="checkbox"
                  checked={review[l.code] === "approved"}
                  onChange={(e) => {
                    const code = l.code as "fr" | "en";
                    setReview((r) => ({ ...r, [code]: e.target.checked ? "approved" : "pending" }));
                  }}
                  className="sr-only"
                />
                <span
                  className={`grid size-4 place-items-center rounded border ${
                    review[l.code] === "approved"
                      ? "border-emerald-300 bg-emerald-300 text-navy"
                      : "border-gold/60"
                  }`}
                >
                  {review[l.code] === "approved" && <Check className="size-3" />}
                </span>
                {review[l.code] === "approved" ? t("translationApproved") : t("translationCheck")}
              </label>
            )}
            <label className="block">
              <span className={label}>{t("productName")}</span>
              {langField(l.code, name, setName, { required: l.code === "he" })}
            </label>
            <label className="block">
              <span className={label}>{t("productSubtitle")}</span>
              {langField(l.code, subtitle, setSubtitle, {})}
            </label>
            <label className="block">
              <span className={label}>{t("productDescription")}</span>
              {langField(l.code, description, setDescription, { multiline: true })}
            </label>
          </fieldset>
        ))}
      </div>

      <div>
        <p className={label}>{t("images")}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative size-28 overflow-hidden rounded-xl border border-white/10"
            >
              <img src={url} alt="" className="size-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 start-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy">
                  {t("mainImage")}
                </span>
              )}
              <button
                type="button"
                aria-label={t("delete")}
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                className="absolute top-1 end-1 grid size-6 place-items-center rounded-full bg-navy/80 text-ivory hover:text-red-300"
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <button
                  type="button"
                  aria-label="previous"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="grid size-6 place-items-center rounded-full bg-navy/80 text-ivory disabled:opacity-30"
                >
                  <Prev className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="next"
                  disabled={i === images.length - 1}
                  onClick={() => move(i, 1)}
                  className="grid size-6 place-items-center rounded-full bg-navy/80 text-ivory disabled:opacity-30"
                >
                  <Next className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
          <label className="grid size-28 cursor-pointer place-items-center rounded-xl border border-dashed border-white/20 text-center text-xs text-ivory/60 hover:border-gold/50 hover:text-gold-2">
            {uploading ? t("uploading") : `+ ${t("addImages")}`}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => {
                upload(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
              className="sr-only"
            />
          </label>
        </div>
        <p className="mt-2 text-[11px] text-ivory/40">{t("pasteImageHint")}</p>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy || uploading}
          className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold-2 disabled:opacity-60"
        >
          {t("save")}
        </button>
        <button
          type="button"
          onClick={cancel}
          className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-ivory transition hover:border-gold/50"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
