import type { L } from "./i18n";
import candlesticks from "@/assets/candlesticks.jpg";
import perfume from "@/assets/perfume.jpg";
import jewelry from "@/assets/jewelry.jpg";
import shabbatSet from "@/assets/shabbat-set.jpg";
import babySet from "@/assets/baby-set.jpg";
import sweets from "@/assets/sweets.jpg";
import book from "@/assets/book.jpg";
import heroGift from "@/assets/hero-gift.jpg";

export type Category = {
  slug: string;
  label: L;
  group: "holidays" | "birthday" | "main";
};

export const categories: Category[] = [
  { slug: "rosh-hashana", group: "holidays", label: { he: "ראש השנה", fr: "Roch Hachana", en: "Rosh Hashanah" } },
  { slug: "sukkot", group: "holidays", label: { he: "סוכות", fr: "Souccot", en: "Sukkot" } },
  { slug: "hanukkah", group: "holidays", label: { he: "חנוכה", fr: "Hanouka", en: "Hanukkah" } },
  { slug: "tu-bishvat", group: "holidays", label: { he: "ט״ו בשבט", fr: "Tou Bichvat", en: "Tu BiShvat" } },
  { slug: "purim", group: "holidays", label: { he: "פורים", fr: "Pourim", en: "Purim" } },
  { slug: "pesach", group: "holidays", label: { he: "פסח", fr: "Pessah", en: "Passover" } },
  { slug: "shavuot", group: "holidays", label: { he: "שבועות", fr: "Chavouot", en: "Shavuot" } },
  { slug: "shabbat", group: "main", label: { he: "שבת", fr: "Chabbat", en: "Shabbat" } },
  { slug: "birthday-child", group: "birthday", label: { he: "יומולדת · ילד/ה", fr: "Anniversaire · Enfant", en: "Birthday · Child" } },
  { slug: "birthday-teen", group: "birthday", label: { he: "יומולדת · נער/ה", fr: "Anniversaire · Ado", en: "Birthday · Teen" } },
  { slug: "birthday-adult", group: "birthday", label: { he: "יומולדת · מבוגר/ת", fr: "Anniversaire · Adulte", en: "Birthday · Adult" } },
  { slug: "baby", group: "main", label: { he: "לתינוק", fr: "Bébé", en: "Baby" } },
  { slug: "bar-mitzvah", group: "main", label: { he: "בר מצווה", fr: "Bar Mitsva", en: "Bar Mitzvah" } },
  { slug: "bat-mitzvah", group: "main", label: { he: "בת מצווה", fr: "Bat Mitsva", en: "Bat Mitzvah" } },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export type Product = {
  id: string;
  category: string;
  name: L;
  subtitle: L;
  description: L;
  price: number;
  images: string[];
};

type Base = {
  key: string;
  img: string;
  price: number;
  name: L;
  subtitle: L;
  description: L;
};

const pool: Base[] = [
  {
    key: "candles",
    img: candlesticks,
    price: 385,
    name: { he: "זוג פמוטי זהב מגולפים", fr: "Paire de bougeoirs dorés", en: "Pair of gilded candlesticks" },
    subtitle: { he: "פליז מוזהב · 24 ס״מ", fr: "Laiton doré · 24 cm", en: "Gilded brass · 24 cm" },
    description: {
      he: "זוג פמוטים מפליז מוזהב בעיטור ידני, ארוזים בקופסת מתנה עם סרט זהב. מתנה שנשארת על השולחן שנים.",
      fr: "Une paire de bougeoirs en laiton doré, ciselés à la main, présentés dans un coffret au ruban doré. Un cadeau qui reste sur la table pendant des années.",
      en: "A pair of hand-chased gilded brass candlesticks in a gift box with a gold ribbon. A gift that stays on the table for years.",
    },
  },
  {
    key: "perfume",
    img: perfume,
    price: 640,
    name: { he: "בושם קריסטל ״זהב טהור״", fr: "Parfum cristal « Or pur »", en: "Crystal perfume 'Pure Gold'" },
    subtitle: { he: "30 מ״ל · קופסת מתנה", fr: "30 ml · coffret cadeau", en: "30 ml · gift box" },
    description: {
      he: "בקבוק קריסטל מלוטש עם פקק זהב, ניחוח פרחוני עדין עם בסיס וניל ועץ אגוז. מגיע בקופסת עור כחולה.",
      fr: "Flacon en cristal taillé au bouchon doré, fragrance florale délicate sur fond de vanille et de bois. Livré dans un coffret en cuir bleu.",
      en: "Cut-crystal bottle with a gold cap, a delicate floral scent over vanilla and wood. Arrives in a blue leather case.",
    },
  },
  {
    key: "jewelry",
    img: jewelry,
    price: 980,
    name: { he: "סט תכשיטי זהב עם יהלומון", fr: "Parure en or et diamant", en: "Gold jewelry set with diamond" },
    subtitle: { he: "זהב 14 קראט · תעודה", fr: "Or 14 carats · certificat", en: "14k gold · certificate" },
    description: {
      he: "שרשרת ועגילים תואמים בעבודת פיליגרן עדינה, משובצים יהלומון. מגיעים בקופסת עץ עם תעודת אחריות.",
      fr: "Collier et boucles d'oreilles assortis en filigrane délicat, sertis d'un petit diamant. Coffret en bois et certificat inclus.",
      en: "Matching necklace and earrings in delicate filigree, set with a small diamond. Wooden case and certificate included.",
    },
  },
  {
    key: "shabbat",
    img: shabbatSet,
    price: 520,
    name: { he: "מארז שבת מהודר", fr: "Coffret Chabbat d'exception", en: "Deluxe Shabbat set" },
    subtitle: { he: "גביע קידוש ומפת חלה", fr: "Coupe de Kiddouch et couvre-halla", en: "Kiddush cup and challah cover" },
    description: {
      he: "גביע קידוש מכסף ומפת חלה מקטיפה רקומה, מונחים בקופסת עץ מרופדת. מארז שמביא את השבת הביתה.",
      fr: "Coupe de Kiddouch en argent et couvre-halla en velours brodé, dans un coffret en bois doublé. Le Chabbat à la maison.",
      en: "Silver Kiddush cup and embroidered velvet challah cover in a lined wooden case. Shabbat, delivered.",
    },
  },
  {
    key: "sweets",
    img: sweets,
    price: 185,
    name: { he: "מארז פרלינים מוזהב", fr: "Coffret de pralines dorées", en: "Gilded praline box" },
    subtitle: { he: "12 פרלינים · שוקולד בלגי", fr: "12 pralines · chocolat belge", en: "12 pralines · Belgian chocolate" },
    description: {
      he: "שתים-עשרה פרלינים בעבודת יד עטופים בנייר זהב, בקופסה כחולה עם סרט. מתאים לכל גיל ולכל אירוע.",
      fr: "Douze pralines artisanales enveloppées d'or, dans un coffret bleu à ruban. Pour tous les âges et toutes les occasions.",
      en: "Twelve handmade pralines wrapped in gold foil, in a blue ribboned box. Right for any age and any occasion.",
    },
  },
  {
    key: "book",
    img: book,
    price: 295,
    name: { he: "סידור עור עם הקדשה", fr: "Livre de prières en cuir gravé", en: "Leather prayer book, engraved" },
    subtitle: { he: "עור אמיתי · חריטת שם", fr: "Cuir véritable · gravure", en: "Real leather · name engraving" },
    description: {
      he: "סידור בכריכת עור חומה עם אותיות זהב וסימנייה, כולל חריטת שם אישית על הכריכה.",
      fr: "Livre relié en cuir brun, lettres dorées et marque-page, avec gravure du prénom sur la couverture.",
      en: "Brown leather binding with gold lettering and a ribbon marker, including personal name engraving.",
    },
  },
  {
    key: "baby",
    img: babySet,
    price: 340,
    name: { he: "מארז ברוך הבא לתינוק", fr: "Coffret bienvenue bébé", en: "Welcome baby set" },
    subtitle: { he: "שמיכת צמר ורעשן כסף", fr: "Couverture et hochet argenté", en: "Knit blanket and silver rattle" },
    description: {
      he: "שמיכת צמר סרוגה ברכות ורעשן כסף מגולף, מונחים בקופסה כחולה עם סרט זהב וכרטיס ברכה.",
      fr: "Couverture tricotée toute douce et hochet en argent ciselé, dans un coffret bleu au ruban doré avec carte.",
      en: "Softly knitted blanket and an engraved silver rattle in a blue box with gold ribbon and a card.",
    },
  },
  {
    key: "signature",
    img: heroGift,
    price: 450,
    name: { he: "מארז החתימה שלנו", fr: "Notre coffret signature", en: "Our signature box" },
    subtitle: { he: "בושם, תכשיט וכרטיס", fr: "Parfum, bijou et carte", en: "Perfume, jewel and card" },
    description: {
      he: "מארז החתימה של הבית: בושם קטן, תכשיט עדין וכרטיס ברכה בכתב ידכם, בקופסה כחולה עם סרט זהב.",
      fr: "Le coffret signature de la maison : un petit parfum, un bijou délicat et votre carte manuscrite, dans un écrin bleu au ruban doré.",
      en: "The house signature: a small perfume, a delicate jewel and your handwritten card, in a blue box with a gold ribbon.",
    },
  },
];

const galleryFor = (img: string) => {
  const others = [heroGift, candlesticks, sweets].filter((i) => i !== img).slice(0, 3);
  return [img, ...others];
};

export const products: Product[] = categories.flatMap((cat, ci) =>
  pool.map((base, pi) => ({
    id: `${cat.slug}-${base.key}`,
    category: cat.slug,
    name: base.name,
    subtitle: base.subtitle,
    description: base.description,
    price: base.price + ((ci * 7 + pi * 5) % 6) * 10,
    images: galleryFor(base.img),
  })),
);

export const productsByCategory = (slug: string) => products.filter((p) => p.category === slug);
export const getProduct = (id: string) => products.find((p) => p.id === id);
export const featured = products.filter((p) => p.category === "bat-mitzvah").slice(0, 3);
