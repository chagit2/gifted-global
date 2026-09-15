import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "he" | "fr" | "en";
export type L = { he: string; fr: string; en: string };

export const LANGS: { code: Lang; label: string }[] = [
  { code: "he", label: "עברית" },
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

const dict = {
  brandName: { he: "מתנות", fr: "Matanot", en: "Matanot" },
  tagline: {
    he: "שולחים מתנות בין צרפת לישראל ולכל העולם",
    fr: "Des cadeaux entre la France, Israël et le monde",
    en: "Sending gifts between France, Israel and the world",
  },
  navHome: { he: "בית", fr: "Accueil", en: "Home" },
  navHolidays: { he: "חגים", fr: "Fêtes", en: "Holidays" },
  navShabbat: { he: "שבת", fr: "Chabbat", en: "Shabbat" },
  navBirthday: { he: "יומולדת", fr: "Anniversaire", en: "Birthday" },
  navBaby: { he: "לתינוק", fr: "Bébé", en: "Baby" },
  navBar: { he: "בר מצווה", fr: "Bar Mitsva", en: "Bar Mitzvah" },
  navBat: { he: "בת מצווה", fr: "Bat Mitsva", en: "Bat Mitzvah" },
  navAbout: { he: "אודות", fr: "À propos", en: "About" },
  cart: { he: "סל קניות", fr: "Panier", en: "Cart" },
  items: { he: "פריטים", fr: "articles", en: "items" },
  heroBadge: { he: "צרפת · ישראל · העולם", fr: "France · Israël · Monde", en: "France · Israel · World" },
  heroLine1: { he: "מתנת בת מצווה", fr: "Un cadeau de Bat Mitsva", en: "A Bat Mitzvah gift" },
  heroLine2: { he: "לנכדה בישראל", fr: "pour ma petite-fille", en: "for a granddaughter" },
  heroLine3: { he: "מאהבה", fr: "avec amour", en: "with love" },
  heroText: {
    he: "בחרו מתנה עדינה לאהובים, כתבו מכתב אישי, ואנחנו נשלח אותה ישירות לכתובת — באריזה יוקרתית וסרט זהב.",
    fr: "Choisissez un cadeau délicat, écrivez une lettre personnelle, et nous l'envoyons directement — dans un écrin luxueux au ruban doré.",
    en: "Choose a delicate gift, write a personal letter, and we deliver it to the door — in a luxurious box with a gold ribbon.",
  },
  ctaBrowse: { he: "צפייה במתנות", fr: "Voir les cadeaux", en: "Browse gifts" },
  ctaHow: { he: "איך זה עובד?", fr: "Comment ça marche ?", en: "How it works" },
  statRating: { he: "★ 4.9 (1,240)", fr: "★ 4.9 (1 240)", en: "★ 4.9 (1,240)" },
  statShipping: { he: "משלוח תוך 3 ימים", fr: "Livraison en 3 jours", en: "Delivery in 3 days" },
  statLangs: { he: "3 שפות", fr: "3 langues", en: "3 languages" },
  suggested: { he: "מוצע עבורך", fr: "Suggéré pour vous", en: "Suggested for you" },
  recommendedCats: { he: "קטגוריות מומלצות", fr: "Catégories phares", en: "Featured categories" },
  catsNote: {
    he: "7 חגים · 3 גילאי יומולדת · תינוק · בר ובת מצווה",
    fr: "7 fêtes · 3 âges · bébé · Bar et Bat Mitsva",
    en: "7 holidays · 3 ages · baby · Bar & Bat Mitzvah",
  },
  addToCart: { he: "הוספה לסל", fr: "Ajouter au panier", en: "Add to cart" },
  buyNow: { he: "קנה עכשיו", fr: "Acheter", en: "Buy now" },
  inStock: { he: "קיים במלאי · משלוח 3 ימים", fr: "En stock · 3 jours", en: "In stock · 3 days" },
  letterTitle: { he: "מכתב אישי למתנה זו", fr: "Lettre personnelle pour ce cadeau", en: "Personal letter for this gift" },
  letterNote: {
    he: "יודפס על נייר יוקרתי ויונח בתוך הקופסה",
    fr: "Imprimée sur papier de luxe et placée dans le coffret",
    en: "Printed on fine paper and placed inside the box",
  },
  letterPlaceholder: {
    he: "לנכדתי היקרה, מזל טוב מכל הלב...",
    fr: "À ma chère petite-fille, tous mes vœux...",
    en: "To my dear granddaughter, warmest wishes...",
  },
  reviews: { he: "★ 4.9 · 218 ביקורות", fr: "★ 4.9 · 218 avis", en: "★ 4.9 · 218 reviews" },
  emptyCart: { he: "הסל ריק", fr: "Le panier est vide", en: "Your cart is empty" },
  total: { he: "סה\u05f4כ", fr: "Total", en: "Total" },
  checkout: { he: "מעבר לתשלום", fr: "Paiement", en: "Checkout" },
  remove: { he: "הסרה", fr: "Retirer", en: "Remove" },
  qty: { he: "כמות", fr: "Quantité", en: "Qty" },
  senderDetails: { he: "פרטי השולח", fr: "Vos coordonnées", en: "Sender details" },
  senderName: { he: "שם השולח", fr: "Nom de l'expéditeur", en: "Sender name" },
  senderNameNote: {
    he: "שימו לב: זהו השם שמקבל המתנה יראה על הכרטיס",
    fr: "Attention : c'est le nom que verra le destinataire sur la carte",
    en: "Note: this is the name the gift recipient will see on the card",
  },
  phone: { he: "טלפון", fr: "Téléphone", en: "Phone" },
  shippingTitle: { he: "כתובת למשלוח המתנה", fr: "Adresse de livraison", en: "Shipping address" },
  street: { he: "רחוב ומספר", fr: "Rue et numéro", en: "Street and number" },
  city: { he: "עיר", fr: "Ville", en: "City" },
  country: { he: "מדינה", fr: "Pays", en: "Country" },
  zip: { he: "מיקוד", fr: "Code postal", en: "Zip code" },
  lettersTitle: { he: "מכתב לכל מתנה", fr: "Une lettre par cadeau", en: "A letter for each gift" },
  paymentTitle: { he: "פרטי אשראי", fr: "Carte bancaire", en: "Card details" },
  cardNumber: { he: "מספר כרטיס", fr: "Numéro de carte", en: "Card number" },
  expiry: { he: "תוקף", fr: "Expiration", en: "Expiry" },
  cvv: { he: "CVV", fr: "CVV", en: "CVV" },
  cardHolder: { he: "שם בעל הכרטיס", fr: "Titulaire", en: "Cardholder" },
  placeOrder: { he: "שליחת המתנה", fr: "Envoyer le cadeau", en: "Send the gift" },
  orderDone: { he: "ההזמנה התקבלה!", fr: "Commande reçue !", en: "Order received!" },
  orderDoneText: {
    he: "נשלח אליכם אישור בדואר אלקטרוני, והמתנה תצא לדרכה תוך יום עסקים.",
    fr: "Une confirmation vous sera envoyée et le cadeau partira sous un jour ouvré.",
    en: "A confirmation is on its way and the gift ships within one business day.",
  },
  backHome: { he: "חזרה לבית", fr: "Retour à l'accueil", en: "Back home" },
  required: { he: "שדה חובה", fr: "Champ requis", en: "Required field" },
  aboutTitle: { he: "אודות", fr: "À propos", en: "About" },
  aboutLead: {
    he: "אנחנו מקרבים לבבות בין יבשות — מתנה אחת בכל פעם.",
    fr: "Nous rapprochons les cœurs entre continents — un cadeau à la fois.",
    en: "We bring hearts closer across continents — one gift at a time.",
  },
  aboutBody: {
    he: "הכול התחיל מסבא בפריז שרצה לשלוח מתנת בת מצווה לנכדתו בירושלים, ולא ידע איך. היום אנחנו בוחרים עבורכם מתנות יוקרתיות לכל חג ולכל אירוע, אורזים אותן בעבודת יד, מצרפים מכתב אישי בכתב ידכם, ושולחים עד הבית. בעברית, בצרפתית ובאנגלית.",
    fr: "Tout a commencé avec un grand-père à Paris qui voulait envoyer un cadeau de Bat Mitsva à sa petite-fille à Jérusalem. Aujourd'hui nous sélectionnons des cadeaux d'exception pour chaque fête, les emballons à la main, y joignons votre lettre personnelle et les livrons à domicile. En hébreu, en français et en anglais.",
    en: "It began with a grandfather in Paris who wanted to send a Bat Mitzvah gift to his granddaughter in Jerusalem. Today we curate exceptional gifts for every holiday and milestone, wrap them by hand, add your personal letter and deliver to the door. In Hebrew, French and English.",
  },
  footerRights: { he: "כל הזכויות שמורות", fr: "Tous droits réservés", en: "All rights reserved" },
  terms: { he: "תנאי שימוש", fr: "Conditions", en: "Terms" },
  shippingLink: { he: "משלוחים", fr: "Livraisons", en: "Shipping" },
  contact: { he: "צור קשר", fr: "Contact", en: "Contact" },
  giftsIn: { he: "מתנות בקטגוריה", fr: "Cadeaux de la catégorie", en: "Gifts in" },
  howTitle: { he: "איך זה עובד", fr: "Comment ça marche", en: "How it works" },
  how1: { he: "בוחרים מתנה", fr: "Choisissez un cadeau", en: "Choose a gift" },
  how1t: { he: "לפי חג, אירוע או גיל", fr: "Par fête, occasion ou âge", en: "By holiday, occasion or age" },
  how2: { he: "כותבים מכתב", fr: "Écrivez une lettre", en: "Write a letter" },
  how2t: { he: "מכתב אישי לכל מתנה", fr: "Une lettre par cadeau", en: "One letter per gift" },
  how3: { he: "אנחנו שולחים", fr: "Nous livrons", en: "We deliver" },
  how3t: { he: "אריזת יוקרה עד הבית", fr: "Écrin de luxe à domicile", en: "Luxury box to the door" },
} satisfies Record<string, L>;

export type Key = keyof typeof dict;

const I18nContext = createContext<{
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  tl: (v: L) => string;
}>({ lang: "he", dir: "rtl", setLang: () => {}, t: (k) => dict[k].he, tl: (v) => v.he });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("he");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && ["he", "fr", "en"].includes(saved)) setLangState(saved);
  }, []);

  const dir: "rtl" | "ltr" = lang === "he" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  return (
    <I18nContext.Provider
      value={{ lang, dir, setLang, t: (k) => dict[k][lang], tl: (v) => v[lang] }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);

export const formatPrice = (n: number, lang: Lang) =>
  lang === "he" ? `₪${n.toLocaleString("he-IL")}` : `₪${n.toLocaleString("en-US")}`;
