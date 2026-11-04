import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ImagePlus,
  Languages,
  Plus,
  Star,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { categories, getCategory } from "@/lib/catalog";
import { formatPrice, LANGS, useI18n, type L, type Lang } from "@/lib/i18n";
import {
  PRODUCTS_KEY,
  toRow,
  useProducts,
  type Product,
  type OptionValue,
  type ProductOption,
} from "@/lib/products";
import { translateProductTexts } from "@/lib/translate.functions";
import { extFor, shrinkImage } from "@/lib/shrinkImage";

const BUCKET = "product-images";
const field =
  "mt-1 w-full rounded-lg border border-navy/10 bg-transparent px-3 py-2 text-sm text-navy placeholder:text-navy/35 focus:border-gold/50 focus:outline-none";
const label = "text-xs text-navy/65";

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

// Photos of a gift's option values (e.g. a silver and a gold set).
const optionImages = (options: ProductOption[]) =>
  options.flatMap((o) => o.values.flatMap((v) => (v.image ? [v.image] : [])));

// Hebrew first in the product form: it is the required, primary language.
const FORM_LANGS = (["he", "fr", "en"] as const).map((code) => LANGS.find((l) => l.code === code)!);

export function ProductsAdmin() {
  const { t, tl, lang } = useI18n();
  const { all, isLoading, isError } = useProducts();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
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
    await removeStored([...p.images, ...optionImages(p.options)]);
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
    <div ref={topRef} className="scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            // A shorter list would leave the page scrolled past its end;
            // bring the top of the list back into view instead.
            if (topRef.current && topRef.current.getBoundingClientRect().top < 0)
              topRef.current.scrollIntoView({ block: "start" });
          }}
          className={`${field} mt-0 w-auto`}
        >
          <option value="" className="bg-white">
            {t("allCategories")} ({all.length})
          </option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug} className="bg-white">
              {tl(c.label)} ({all.filter((p) => p.categories.includes(c.slug)).length})
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setEditing("new")}
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy transition hover:bg-gold-2"
          >
            + {t("addProduct")}
          </button>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <ul className="mt-6 space-y-3">
        {isError ? (
          <li className="text-sm text-red-600">{t("loadError")}</li>
        ) : isLoading ? (
          <li className="text-sm text-navy/70">{t("loading")}</li>
        ) : (
          shown.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-2xl border border-navy/10 bg-white/70 p-3 backdrop-blur-xl"
            >
              <div className="flex flex-col">
                <button
                  aria-label={t("moveUp")}
                  title={t("moveUp")}
                  disabled={i === 0 || moving}
                  onClick={() => move(i, -1)}
                  className="text-navy/70 hover:text-gold-deep disabled:opacity-20"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  aria-label={t("moveDown")}
                  title={t("moveDown")}
                  disabled={i === shown.length - 1 || moving}
                  onClick={() => move(i, 1)}
                  className="text-navy/70 hover:text-gold-deep disabled:opacity-20"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
              <img src={p.images[0]} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-navy">
                  {tl(p.name) || p.name.he}
                  {!p.active && (
                    <span className="ms-2 rounded-full border border-navy/15 px-2 py-0.5 text-[10px] text-navy/70">
                      {t("hiddenBadge")}
                    </span>
                  )}
                  {!p.inStock && (
                    <span className="ms-2 rounded-full border border-red-300/40 px-2 py-0.5 text-[10px] text-red-700">
                      {t("outOfStock")}
                    </span>
                  )}
                </p>
                <p className="text-xs text-navy/70">
                  {p.categories
                    .map((slug) => (getCategory(slug) ? tl(getCategory(slug)!.label) : slug))
                    .join(", ")}{" "}
                  · <span className="text-gold-deep">{formatPrice(p.price, lang)}</span>
                </p>
              </div>
              <button
                onClick={() => setEditing(p)}
                className="text-sm text-navy/75 hover:text-gold-deep"
              >
                {t("edit")}
              </button>
              <button
                onClick={() => onDelete(p)}
                className="text-sm text-red-300/80 hover:text-red-600"
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
  const [options, setOptions] = useState<ProductOption[]>(product?.options ?? []);
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

  // Uploads one photo; returns its URL, or null (with an error shown).
  const uploadFile = async (original: File) => {
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
      return null;
    }
    const url = IMAGE_ROUTE + path;
    setUploaded((prev) => [...prev, url]);
    return url;
  };

  const upload = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setError(null);
    const urls: string[] = [];
    for (const original of files) {
      const url = await uploadFile(original);
      if (url) urls.push(url);
    }
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
  };

  // Photo for one option value (the customer clicks the photo to choose).
  const uploadOptionImage = async (file: File) => {
    setUploading(true);
    setError(null);
    const url = await uploadFile(file);
    setUploading(false);
    return url;
  };

  // Pasted photos go to the option value (or option) that has focus: the
  // photo of that value, or new photo values of that option.
  const pasteToOption = async (target: HTMLElement, files: File[]) => {
    const i = Number(target.dataset["option"]);
    const j = target.dataset["value"] === undefined ? null : Number(target.dataset["value"]);
    for (const [n, file] of files.entries()) {
      const url = await uploadOptionImage(file);
      if (!url) continue;
      setOptions((prev) =>
        prev.map((o, k) =>
          k !== i
            ? o
            : j !== null && n === 0
              ? { ...o, values: o.values.map((v, m) => (m === j ? { ...v, image: url } : v)) }
              : { ...o, values: [...o.values, { ...emptyL(), image: url }] },
        ),
      );
    }
  };

  // Ctrl+V / Cmd+V anywhere while the form is open adds pasted images: to the
  // option being edited, else to the gift's photos.
  // Text pastes (into the name or description fields) are left alone.
  const uploadRef = useRef(upload);
  uploadRef.current = upload;
  const pasteOptionRef = useRef(pasteToOption);
  pasteOptionRef.current = pasteToOption;
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (!files.length) return;
      e.preventDefault();
      const option = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>(
        "[data-option]",
      );
      if (option) pasteOptionRef.current(option, files);
      else uploadRef.current(files);
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

  // Drag a photo onto another, or "make main", to reorder.
  const [dragging, setDragging] = useState<number | null>(null);
  const moveTo = (from: number, to: number) =>
    setImages((prev) => {
      if (from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
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
    // Empty value rows (no label, no photo) are dropped; a missing French or
    // English label shows the Hebrew one.
    const withHe = (l: L): L => ({
      he: l.he.trim(),
      fr: l.fr.trim() || l.he.trim(),
      en: l.en.trim() || l.he.trim(),
    });
    const cleanOptions = options.map((o) => ({
      name: withHe(o.name),
      values: o.values
        .filter((v) => v.he.trim() || v.image)
        .map((v) => ({ ...withHe(v), ...(v.image && { image: v.image }) })),
    }));
    if (cleanOptions.some((o) => !o.name.he || o.values.length === 0))
      return setError(t("optionIncomplete"));
    setBusy(true);
    setError(null);
    const row = toRow(
      {
        // Keep the menu's category order so the primary one is predictable.
        categories: categories.map((c) => c.slug).filter((slug) => cats.includes(slug)),
        name,
        subtitle,
        description,
        price: Number(price),
        images,
        active,
        inStock,
        options: cleanOptions,
        sort: product?.sort ?? nextSort,
      },
      cleanOptions.length > 0 || (product?.options.length ?? 0) > 0,
    );
    const { error } = product
      ? await supabase.from("products").update(row).eq("id", product.id)
      : await supabase.from("products").insert(row);
    setBusy(false);
    if (error) return setError(t("saveError"));
    // Photos taken off the product are no longer needed in storage.
    const kept = new Set([...images, ...optionImages(cleanOptions)]);
    await removeStored(
      [...(product?.images ?? []), ...optionImages(product?.options ?? [])].filter(
        (u) => !kept.has(u),
      ),
    );
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
      className="space-y-6 rounded-2xl border border-navy/10 bg-white/70 p-6 backdrop-blur-xl"
    >
      <h2 className="font-heb text-2xl text-navy">
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
                    ? "border-gold bg-gold/20 text-gold-deep"
                    : "border-navy/15 text-navy/65 hover:border-gold/50 hover:text-navy"
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
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="size-4 accent-gold"
          />
          {t("visible")}
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-navy">
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
          <fieldset key={l.code} className="space-y-3 rounded-xl border border-navy/10 p-4">
            <legend className="px-1 text-xs text-gold-deep">
              {l.label}
              {l.code !== "he" && !name[l.code].trim() && (
                <span className="ms-2 text-navy/70">({t("missingTranslation")})</span>
              )}
            </legend>
            {l.code === "he" && (
              <button
                type="button"
                onClick={translate}
                disabled={!name.he.trim() || translating}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold-deep transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Languages className="size-3.5" />
                {translating ? t("translating") : t("translateToOthers")}
              </button>
            )}
            {l.code !== "he" && review[l.code] !== "none" && (
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                  review[l.code] === "approved"
                    ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-700"
                    : "border-gold/50 bg-gold/10 text-gold-deep"
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

      <OptionsEditor
        options={options}
        onChange={setOptions}
        uploadImage={uploadOptionImage}
        uploading={uploading}
      />

      <div>
        <p className={label}>{t("images")}</p>
        <p className="mt-0.5 text-[11px] text-navy/70">{t("imagesOrderHint")}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={() => setDragging(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging !== null) moveTo(dragging, i);
                setDragging(null);
              }}
              onDragEnd={() => setDragging(null)}
              className={`group relative size-32 cursor-grab overflow-hidden rounded-xl border-2 transition active:cursor-grabbing ${
                i === 0 ? "border-gold" : "border-navy/10"
              } ${dragging === i ? "opacity-40" : ""}`}
            >
              <img src={url} alt="" draggable={false} className="size-full object-cover" />
              {i === 0 ? (
                <span className="absolute top-1 start-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy shadow">
                  {t("mainImage")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => moveTo(i, 0)}
                  aria-label={t("makeMainImage")}
                  title={t("makeMainImage")}
                  className="absolute top-1 start-1 grid size-7 place-items-center rounded-full bg-white/95 text-gold-deep shadow transition hover:bg-gold hover:text-navy"
                >
                  <Star className="size-4" />
                </button>
              )}
              <button
                type="button"
                aria-label={t("delete")}
                title={t("delete")}
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                className="absolute top-1 end-1 grid size-6 place-items-center rounded-full bg-white/95 text-navy shadow hover:text-red-600"
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <button
                  type="button"
                  aria-label={t("moveImageEarlier")}
                  title={t("moveImageEarlier")}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="grid size-7 place-items-center rounded-full bg-white/95 text-navy shadow hover:bg-gold disabled:opacity-0"
                >
                  <Prev className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={t("moveImageLater")}
                  title={t("moveImageLater")}
                  disabled={i === images.length - 1}
                  onClick={() => move(i, 1)}
                  className="grid size-7 place-items-center rounded-full bg-white/95 text-navy shadow hover:bg-gold disabled:opacity-0"
                >
                  <Next className="size-4" />
                </button>
              </div>
            </div>
          ))}
          <label className="grid size-32 cursor-pointer place-items-center rounded-xl border border-dashed border-navy/20 text-center text-xs text-navy/65 hover:border-gold/50 hover:text-gold-deep">
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
        <p className="mt-2 text-[11px] text-navy/70">{t("pasteImageHint")}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
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
          className="rounded-full border border-navy/15 px-6 py-2.5 text-sm text-navy transition hover:border-gold/50"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

// Choices the customer makes on this gift, e.g. "Colour: silver / gold".
// Each value has a photo the customer clicks and/or a label (Hebrew, with
// optional French and English).
function OptionsEditor({
  options,
  onChange,
  uploadImage,
  uploading,
}: {
  options: ProductOption[];
  onChange: Dispatch<SetStateAction<ProductOption[]>>;
  uploadImage: (file: File) => Promise<string | null>;
  uploading: boolean;
}) {
  const { t } = useI18n();
  // Functional updates: photo uploads finish after other edits may have happened.
  const setOption = (i: number, f: (o: ProductOption) => ProductOption) =>
    onChange((prev) => prev.map((x, k) => (k === i ? f(x) : x)));
  const setValue = (i: number, j: number, f: (v: OptionValue) => OptionValue) =>
    setOption(i, (o) => ({ ...o, values: o.values.map((x, k) => (k === j ? f(x) : x)) }));

  // Several photos at once: one new value per photo.
  const addPhotoValues = async (i: number, files: File[]) => {
    for (const file of files) {
      const url = await uploadImage(file);
      if (url) setOption(i, (o) => ({ ...o, values: [...o.values, { ...emptyL(), image: url }] }));
    }
  };

  // Three side-by-side inputs (he / fr / en) for one label.
  const labelInputs = (value: L, set: (v: L) => void, placeholder: string) =>
    FORM_LANGS.map((l) => (
      <input
        key={l.code}
        value={value[l.code]}
        onChange={(e) => set({ ...value, [l.code]: e.target.value })}
        dir={l.code === "he" ? "rtl" : "ltr"}
        maxLength={80}
        placeholder={l.code === "he" ? placeholder : l.label}
        aria-label={`${placeholder} (${l.label})`}
        className={`${field} mt-0`}
      />
    ));

  return (
    <fieldset className="rounded-xl border border-navy/10 p-4">
      <legend className="px-1 text-xs text-gold-deep">{t("productOptions")}</legend>
      <p className="text-[11px] text-navy/70">{t("productOptionsHint")}</p>
      <div className="mt-3 space-y-4">
        {options.map((o, i) => (
          // Focusable (click anywhere in it) so Ctrl+V pastes photos into it.
          <div
            key={i}
            data-option={i}
            tabIndex={-1}
            className="space-y-2 rounded-lg border border-navy/10 bg-white/60 p-3 outline-none focus-within:border-gold/60"
          >
            <div className="flex items-center gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-3">
                {labelInputs(
                  o.name,
                  (name) => setOption(i, (x) => ({ ...x, name })),
                  t("optionName"),
                )}
              </div>
              <button
                type="button"
                onClick={() => onChange((prev) => prev.filter((_, k) => k !== i))}
                aria-label={t("removeOption")}
                title={t("removeOption")}
                className="grid size-8 shrink-0 place-items-center rounded-full text-navy/70 hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className={label}>{t("optionValues")}</p>
            <p className="text-[11px] text-navy/70">{t("pasteOptionImageHint")}</p>
            {o.values.map((v, j) => (
              <div
                key={j}
                data-option={i}
                data-value={j}
                tabIndex={-1}
                className="flex items-center gap-2 rounded-lg ps-4 outline-none focus-within:bg-gold/10"
              >
                {v.image ? (
                  <div className="group relative size-16 shrink-0 overflow-hidden rounded-lg border border-navy/10">
                    <img src={v.image} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setValue(i, j, ({ image: _, ...rest }) => rest)}
                      aria-label={t("removeOptionImage")}
                      title={t("removeOptionImage")}
                      className="absolute top-0.5 end-0.5 grid size-5 place-items-center rounded-full bg-white/95 text-navy shadow hover:text-red-600"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <label
                    title={t("optionImage")}
                    className="grid size-16 shrink-0 cursor-pointer place-items-center rounded-lg border border-dashed border-navy/20 text-center text-[10px] leading-tight text-navy/65 hover:border-gold/50 hover:text-gold-deep"
                  >
                    <ImagePlus className="size-5" />
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        const url = await uploadImage(file);
                        if (url) setValue(i, j, (x) => ({ ...x, image: url }));
                      }}
                      className="sr-only"
                    />
                  </label>
                )}
                <div className="grid flex-1 gap-2 sm:grid-cols-3">
                  {labelInputs(
                    v,
                    (nv) => setValue(i, j, (x) => ({ ...x, ...nv })),
                    v.image ? t("optionLabelOptional") : `${t("optionValues")} ${j + 1}`,
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOption(i, (x) => ({ ...x, values: x.values.filter((_, k) => k !== j) }))
                  }
                  aria-label={t("delete")}
                  title={t("delete")}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-navy/70 hover:text-red-600"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-4 ps-4">
              <button
                type="button"
                onClick={() => setOption(i, (x) => ({ ...x, values: [...x.values, emptyL()] }))}
                className="inline-flex items-center gap-1 text-xs text-gold-deep hover:underline"
              >
                <Plus className="size-3.5" />
                {t("addValue")}
              </button>
              <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-gold-deep hover:underline">
                <ImagePlus className="size-3.5" />
                {uploading ? t("uploading") : t("addPhotoValues")}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={(e) => {
                    addPhotoValues(i, Array.from(e.target.files ?? []));
                    e.target.value = "";
                  }}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange((prev) => [...prev, { name: emptyL(), values: [] }])}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold-deep transition hover:bg-gold/10"
      >
        <Plus className="size-3.5" />
        {t("addOption")}
      </button>
    </fieldset>
  );
}
