import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "he" | "fr" | "en";
export type L = { he: string; fr: string; en: string };

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "he", label: "עברית" },
];

const dict = {
  brandName: { he: "מתנות", fr: "Matanot", en: "Matanot" },
  navHome: { he: "בית", fr: "Accueil", en: "Home" },

  navHolidays: { he: "חגים", fr: "Fêtes", en: "Holidays" },
  navShabbat: { he: "שבת", fr: "Chabbat", en: "Shabbat" },
  navBirthday: { he: "יומולדת", fr: "Anniversaire", en: "Birthday" },
  navBaby: { he: "לתינוק", fr: "Bébé", en: "Baby" },
  navBar: { he: "בר מצווה", fr: "Bar Mitsva", en: "Bar Mitzvah" },
  navBat: { he: "בת מצווה", fr: "Bat Mitsva", en: "Bat Mitzvah" },
  navJudaica: { he: "יודאיקה", fr: "Judaïca", en: "Judaica" },
  navForBoy: { he: "לבן", fr: "Garçon", en: "Boy" },
  navForGirl: { he: "לבת", fr: "Fille", en: "Girl" },
  navAbout: { he: "אודות", fr: "À propos", en: "About" },
  cart: { he: "סל קניות", fr: "Panier", en: "Cart" },
  items: { he: "פריטים", fr: "articles", en: "items" },
  ctaBrowse: { he: "צפייה במתנות", fr: "Voir les cadeaux", en: "Browse gifts" },

  suggested: { he: "מוצע עבורך", fr: "Suggéré pour vous", en: "Suggested for you" },

  recommendedCats: { he: "קטגוריות מומלצות", fr: "Catégories phares", en: "Featured categories" },
  catsNote: {
    he: "7 חגים · 3 גילאי יומולדת · תינוק · בר ובת מצווה",
    fr: "7 fêtes · 3 âges · bébé · Bar et Bat Mitsva",
    en: "7 holidays · 3 ages · baby · Bar & Bat Mitzvah",
  },
  addToCart: { he: "הוספה לסל", fr: "Ajouter au panier", en: "Add to cart" },
  buyNow: { he: "קנה עכשיו", fr: "Acheter", en: "Buy now" },
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
    he: "רחוקים מהעין, קרובים ללב.",
    fr: "Loin des yeux, près du cœur.",
    en: "Far from sight, close to heart.",
  },
  aboutP1: {
    he: "אנחנו יודעים איך זה מרגיש. השמחה המשפחתית מתקרבת – יום הולדת, חתונה, חנוכת בית או פשוט רצון לשמח ולהפתיע את האנשים שאתם הכי אוהבים בארץ – ואתם נמצאים מעבר לים.",
    fr: "Nous savons ce que l'on ressent. Une joie familiale approche – un anniversaire, un mariage, une crémaillère, ou simplement l'envie de faire plaisir et de surprendre ceux que vous aimez le plus en Israël – et vous êtes de l'autre côté de la mer.",
    en: "We know how it feels. A family celebration is coming up – a birthday, a wedding, a housewarming, or simply the wish to delight and surprise the people you love most in Israel – and you are across the sea.",
  },
  aboutP2: {
    he: "המרחק הפיזי עלול לפעמים להרגיש מורכב: איך מוצאים מתנה באמת מיוחדת? איך דואגים שהיא תגיע בזמן? ואיך מספקים את התחושה שאתם שם, מחבקים ומפנקים מקרוב?",
    fr: "La distance peut parfois sembler compliquée : comment trouver un cadeau vraiment spécial ? Comment s'assurer qu'il arrive à temps ? Et comment donner le sentiment que vous êtes là, à les serrer dans vos bras et à les gâter de près ?",
    en: "The physical distance can sometimes feel complicated: how do you find a truly special gift? How do you make sure it arrives on time? And how do you give the feeling that you are right there, hugging and spoiling them up close?",
  },
  aboutP3: {
    he: "בדיוק בשביל זה אנחנו כאן.",
    fr: "C'est exactement pour cela que nous sommes là.",
    en: "That is exactly why we are here.",
  },
  aboutP4: {
    he: "מותג “מתנות” נולד מתוך רצון לגשר על המרחק, ולספק לכם דרך קלה, נוחה ויוקרתית לשלוח אהבה ותשומת לב לכל פינה בישראל.",
    fr: "La marque « Matanot » est née de l'envie de combler la distance et de vous offrir un moyen simple, pratique et élégant d'envoyer amour et attention aux quatre coins d'Israël.",
    en: "The Matanot brand was born from a wish to bridge the distance, giving you an easy, convenient and elegant way to send love and care to every corner of Israel.",
  },
  aboutValuesTitle: {
    he: "מה משקף את העשייה שלנו?",
    fr: "Ce qui reflète notre travail",
    en: "What our work stands for",
  },
  aboutV1t: { he: "עיצוב בטוב טעם", fr: "Un design de bon goût", en: "Tasteful design" },
  aboutV1: {
    he: "כל מתנה אצלנו נבחרת ומעוצבת בסטייל יוקרתי, עדכני ומוקפד, כדי להבטיח שהיא תכבד אתכם ותביא איתה רושם מרשים ומשמח.",
    fr: "Chaque cadeau est choisi et conçu dans un style luxueux, actuel et soigné, pour vous faire honneur et laisser une impression marquante et joyeuse.",
    en: "Every gift is chosen and designed in a luxurious, contemporary and meticulous style, so it does you proud and leaves a striking, joyful impression.",
  },
  aboutV2t: { he: "מתנות לכל אירוע", fr: "Des cadeaux pour chaque occasion", en: "Gifts for every occasion" },
  aboutV2: {
    he: "מגוון פתרונות מעוצבים המותאמים במיוחד לחתונה, חנוכת בית, ימי הולדת או פשוט כדי להגיד “אני חושב עליך”.",
    fr: "Un large choix de créations adaptées au mariage, à la crémaillère, aux anniversaires, ou simplement pour dire « je pense à toi ».",
    en: "A range of designed gifts tailored for weddings, housewarmings and birthdays, or simply to say “I'm thinking of you”.",
  },
  aboutV3t: { he: "המגע האישי שלכם", fr: "Votre touche personnelle", en: "Your personal touch" },
  aboutV3: {
    he: "כדי שהמתנה תהיה אישית באמת, אנו מציעים אפשרות להוסיף את הברכה האישית שלכם, שתודפס על גבי דף מעוצב ויפהפה ותצורף למארז.",
    fr: "Pour que le cadeau soit vraiment personnel, vous pouvez ajouter votre message, imprimé sur une belle page élégante et joint au coffret.",
    en: "To make the gift truly personal, you can add your own greeting, printed on a beautifully designed page and included in the box.",
  },
  aboutV4t: { he: "ראש שקט ורוגע מלא", fr: "Une totale tranquillité d'esprit", en: "Complete peace of mind" },
  aboutV4: {
    he: "אתם יכולים להיות בטוחים שהמחווה שלכם תגיע בצורה מושלמת, תכבד את האירוע ותעניק ליקירכם את ההרגשה שחשבתם עליהם מכל הלב – גם כשאתם רחוקים.",
    fr: "Soyez assurés que votre attention arrivera parfaitement, honorera l'événement et donnera à vos proches le sentiment que vous avez pensé à eux de tout votre cœur – même de loin.",
    en: "Rest assured that your gesture will arrive perfectly, honor the occasion and give your loved ones the feeling that you thought of them with all your heart – even from afar.",
  },
  aboutClosing: {
    he: "אנחנו מזמינים אתכם לבחור את המתנה המושלמת, ולהרגיש הכי קרובים שיש.",
    fr: "Nous vous invitons à choisir le cadeau parfait, et à vous sentir plus proches que jamais.",
    en: "We invite you to choose the perfect gift, and to feel as close as can be.",
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
