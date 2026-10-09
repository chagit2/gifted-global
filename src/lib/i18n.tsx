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
  account: { he: "אזור אישי", fr: "Mon compte", en: "My account" },
  login: { he: "התחברות", fr: "Connexion", en: "Sign in" },
  signup: { he: "הרשמה", fr: "Inscription", en: "Sign up" },
  email: { he: "מייל", fr: "E-mail", en: "Email" },
  password: { he: "סיסמה", fr: "Mot de passe", en: "Password" },
  passwordHint: { he: "לפחות 6 תווים", fr: "Au moins 6 caractères", en: "At least 6 characters" },
  noAccount: { he: "אין לכם חשבון? להרשמה", fr: "Pas de compte ? Inscrivez-vous", en: "No account? Sign up" },
  haveAccount: { he: "כבר רשומים? להתחברות", fr: "Déjà inscrit ? Connectez-vous", en: "Already registered? Sign in" },
  signOut: { he: "התנתקות", fr: "Déconnexion", en: "Sign out" },
  authError: { he: "המייל או הסיסמה שגויים", fr: "E-mail ou mot de passe incorrect", en: "Wrong email or password" },
  signupError: { he: "ההרשמה לא הצליחה.", fr: "L'inscription a échoué.", en: "Sign-up failed." },
  signupCheckEmail: {
    he: "שלחנו לכם מייל לאישור ההרשמה. אחרי האישור אפשר להתחבר.",
    fr: "Nous vous avons envoyé un e-mail de confirmation. Après confirmation, vous pourrez vous connecter.",
    en: "We sent you a confirmation email. Once confirmed, you can sign in.",
  },
  loginForOrders: {
    he: "רוצים לעקוב אחרי ההזמנה באזור האישי? התחברו לפני השליחה.",
    fr: "Pour suivre votre commande dans votre espace, connectez-vous avant l'envoi.",
    en: "Want to track this order in your account? Sign in before sending.",
  },
  myOrders: { he: "ההזמנות שלי", fr: "Mes commandes", en: "My orders" },
  noOrders: { he: "עדיין אין הזמנות", fr: "Aucune commande pour l'instant", en: "No orders yet" },
  order: { he: "הזמנה", fr: "Commande", en: "Order" },
  shipTo: { he: "נשלח אל", fr: "Livré à", en: "Ship to" },
  loading: { he: "טוען...", fr: "Chargement...", en: "Loading..." },
  loadError: { he: "הטעינה נכשלה, נסו לרענן", fr: "Échec du chargement, actualisez", en: "Failed to load, please refresh" },
  adminArea: { he: "ניהול האתר", fr: "Administration", en: "Admin" },
  notAllowed: { he: "אין לך הרשאה לעמוד הזה", fr: "Accès non autorisé", en: "You don't have access to this page" },
  ordersOpen: { he: "פתוחות", fr: "En cours", en: "Open" },
  ordersDone: { he: "הסתיימו", fr: "Terminées", en: "Completed" },
  statusLabel: { he: "סטטוס", fr: "Statut", en: "Status" },
  saveError: { he: "השמירה נכשלה, נסו שוב", fr: "Échec de l'enregistrement", en: "Saving failed, try again" },
  status_new: { he: "התקבלה", fr: "Reçue", en: "Received" },
  status_preparing: { he: "בהכנה", fr: "En préparation", en: "Preparing" },
  status_shipped: { he: "נשלחה", fr: "Expédiée", en: "Shipped" },
  status_delivered: { he: "נמסרה", fr: "Livrée", en: "Delivered" },
  status_cancelled: { he: "בוטלה", fr: "Annulée", en: "Cancelled" },
  authWeakPassword: {
    he: "הסיסמה חלשה מדי. נסו סיסמה ארוכה יותר, עם אותיות ומספרים.",
    fr: "Mot de passe trop faible. Essayez plus long, avec lettres et chiffres.",
    en: "Password is too weak. Try a longer one with letters and numbers.",
  },
  authRateLimit: {
    he: "היו יותר מדי ניסיונות בזמן קצר. נסו שוב בעוד כשעה.",
    fr: "Trop de tentatives. Réessayez dans environ une heure.",
    en: "Too many attempts. Please try again in about an hour.",
  },
  authSignupDisabled: {
    he: "ההרשמה כרגע סגורה באתר.",
    fr: "Les inscriptions sont actuellement fermées.",
    en: "Sign-ups are currently closed.",
  },
  authUserExists: {
    he: "המייל הזה כבר רשום. נסו להתחבר.",
    fr: "Cet e-mail est déjà inscrit. Connectez-vous.",
    en: "This email is already registered. Try signing in.",
  },
  authInvalidEmail: { he: "כתובת המייל לא תקינה", fr: "Adresse e-mail invalide", en: "Invalid email address" },
  authNotConfirmed: {
    he: "צריך קודם לאשר את המייל. חפשו את הודעת האישור בתיבת הדואר.",
    fr: "Veuillez d'abord confirmer votre e-mail.",
    en: "Please confirm your email first. Check your inbox.",
  },
  noProducts: { he: "אין עדיין מתנות בקטגוריה הזו", fr: "Pas encore de cadeaux ici", en: "No gifts here yet" },
  tabOrders: { he: "הזמנות", fr: "Commandes", en: "Orders" },
  tabProducts: { he: "מוצרים", fr: "Produits", en: "Products" },
  addProduct: { he: "הוספת מוצר", fr: "Ajouter un produit", en: "Add product" },
  editProduct: { he: "עריכת מוצר", fr: "Modifier le produit", en: "Edit product" },
  edit: { he: "עריכה", fr: "Modifier", en: "Edit" },
  delete: { he: "מחיקה", fr: "Supprimer", en: "Delete" },
  confirmDelete: {
    he: "למחוק את המוצר? אי אפשר לבטל את זה.",
    fr: "Supprimer ce produit ? Action irréversible.",
    en: "Delete this product? This can't be undone.",
  },
  category: { he: "קטגוריה", fr: "Catégorie", en: "Category" },
  allCategories: { he: "כל הקטגוריות", fr: "Toutes les catégories", en: "All categories" },
  productName: { he: "שם המוצר", fr: "Nom du produit", en: "Product name" },
  productSubtitle: { he: "תיאור קצר", fr: "Sous-titre", en: "Short description" },
  productDescription: { he: "תיאור מלא", fr: "Description", en: "Full description" },
  price: { he: "מחיר (₪)", fr: "Prix (₪)", en: "Price (₪)" },
  visible: { he: "מוצג באתר", fr: "Visible sur le site", en: "Shown on the site" },
  hiddenBadge: { he: "מוסתר", fr: "Masqué", en: "Hidden" },
  images: { he: "תמונות", fr: "Photos", en: "Photos" },
  addImages: { he: "הוספת תמונות", fr: "Ajouter des photos", en: "Add photos" },
  mainImage: { he: "ראשית", fr: "Principale", en: "Main" },
  uploading: { he: "מעלה...", fr: "Envoi...", en: "Uploading..." },
  uploadError: { he: "העלאת התמונה נכשלה", fr: "Échec de l'envoi de la photo", en: "Photo upload failed" },
  save: { he: "שמירה", fr: "Enregistrer", en: "Save" },
  cancel: { he: "ביטול", fr: "Annuler", en: "Cancel" },
  imagesRequired: { he: "צריך לפחות תמונה אחת", fr: "Au moins une photo", en: "At least one photo is required" },
  hebrewRequired: {
    he: "שם המוצר בעברית הוא חובה",
    fr: "Le nom en hébreu est obligatoire",
    en: "The Hebrew name is required",
  },
  missingTranslation: { he: "חסר תרגום", fr: "Traduction manquante", en: "Missing translation" },
  requiredNote: { he: "שדות המסומנים ב-* הם חובה", fr: "Les champs marqués * sont obligatoires", en: "Fields marked * are required" },
  shipsIsraelOnly: {
    he: "המשלוחים הם לכתובות בישראל בלבד",
    fr: "Livraison uniquement à des adresses en Israël",
    en: "We deliver to addresses in Israel only",
  },
  allGifts: { he: "כל המתנות", fr: "Tous les cadeaux", en: "All gifts" },
  letterExpand: { he: "הצגת המכתב המלא", fr: "Afficher toute la lettre", en: "Show full letter" },
  letterCollapse: { he: "צמצום", fr: "Réduire", en: "Collapse" },
  emailNotRegistered: {
    he: "המייל הזה עוד לא רשום אצלנו. השלימו את ההרשמה כאן:",
    fr: "Cet e-mail n'est pas encore inscrit. Finalisez votre inscription ici :",
    en: "This email isn't registered yet. Finish signing up here:",
  },
  copyLetter: { he: "העתקת המכתב", fr: "Copier la lettre", en: "Copy letter" },
  copied: { he: "הועתק", fr: "Copié", en: "Copied" },
  categoriesLabel: {
    he: "קטגוריות (אפשר לבחור כמה)",
    fr: "Catégories (plusieurs possibles)",
    en: "Categories (choose any)",
  },
  categoriesRequired: { he: "צריך לבחור לפחות קטגוריה אחת", fr: "Choisissez au moins une catégorie", en: "Choose at least one category" },
  pasteImageHint: {
    he: "אפשר גם להעתיק תמונה ולהדביק אותה כאן עם Ctrl+V",
    fr: "Vous pouvez aussi copier une image et la coller ici avec Ctrl+V",
    en: "You can also copy an image and paste it here with Ctrl+V",
  },
  translateToOthers: { he: "תרגום לאנגלית ולצרפתית", fr: "Traduire en anglais et français", en: "Translate to English and French" },
  translating: { he: "מתרגם...", fr: "Traduction...", en: "Translating..." },
  translateOverwrite: {
    he: "יש כבר טקסט באנגלית או בצרפתית. להחליף אותו בתרגום החדש?",
    fr: "Il y a déjà du texte en anglais ou en français. Le remplacer ?",
    en: "There's already English or French text. Replace it with the new translation?",
  },
  translateError: { he: "התרגום נכשל, נסו שוב", fr: "La traduction a échoué, réessayez", en: "Translation failed, try again" },
  translateQuota: {
    he: "נגמרה מכסת התרגומים החינמית להיום. נסו שוב מחר, או תרגמו ידנית.",
    fr: "Quota de traduction gratuite épuisé pour aujourd'hui. Réessayez demain.",
    en: "Today's free translation quota is used up. Try again tomorrow.",
  },
  translationCheck: {
    he: "תרגום אוטומטי. בדקו ותקנו אם צריך, ואז סמנו כאן",
    fr: "Traduction automatique : vérifiez, corrigez si besoin, puis cochez",
    en: "Machine translation: review, fix if needed, then tick here",
  },
  translationApproved: { he: "אישרתי את התרגום", fr: "Traduction validée", en: "Translation approved" },
  translateApproveFirst: {
    he: "יש לאשר את התרגום לצרפתית ולאנגלית לפני השמירה",
    fr: "Validez les traductions avant d'enregistrer",
    en: "Approve the translations before saving",
  },
  subtotal: { he: "סכום המתנות", fr: "Sous-total", en: "Subtotal" },
  shipping: { he: "משלוח", fr: "Livraison", en: "Shipping" },
  outOfStock: { he: "אזל מהמלאי", fr: "Épuisé", en: "Out of stock" },
  inStockLabel: { he: "במלאי", fr: "En stock", en: "In stock" },
  shipCommitment: {
    he: "אנחנו מתחייבים לשלוח את המתנה תוך 7 ימי עסקים מרגע ההזמנה",
    fr: "Nous nous engageons à expédier le cadeau sous 7 jours ouvrés",
    en: "We commit to shipping the gift within 7 business days of your order",
  },
  deliveryDate: { he: "תאריך מסירה רצוי", fr: "Date de livraison souhaitée", en: "Preferred delivery date" },
  deliveryDateHint: {
    he: "לא חובה. אפשר לבחור החל מ-{date}",
    fr: "Facultatif. À partir du {date}",
    en: "Optional. From {date} onwards",
  },
  deliveryTooSoon: {
    he: "תאריך המסירה מוקדם מדי. בחרו תאריך מאוחר יותר.",
    fr: "Date de livraison trop proche. Choisissez une date plus tardive.",
    en: "That delivery date is too soon. Please pick a later one.",
  },
  customerNote: { he: "הערות להזמנה", fr: "Remarques sur la commande", en: "Order notes" },
  customerNoteHint: {
    he: "לא חובה. משהו שחשוב לנו לדעת על המתנה",
    fr: "Facultatif. Une précision sur votre cadeau",
    en: "Optional. Anything we should know about your gift",
  },
  coupon: { he: "קוד קופון", fr: "Code promo", en: "Coupon code" },
  applyCoupon: { he: "החלה", fr: "Appliquer", en: "Apply" },
  removeCoupon: { he: "הסרה", fr: "Retirer", en: "Remove" },
  couponInvalid: { he: "קוד הקופון לא תקף", fr: "Code promo invalide", en: "Invalid coupon code" },
  discount: { he: "הנחה", fr: "Réduction", en: "Discount" },
  productUnavailable: {
    he: "אחת המתנות בסל אזלה מהמלאי או הוסרה. הסירו אותה מהסל ונסו שוב.",
    fr: "Un cadeau du panier n'est plus disponible. Retirez-le et réessayez.",
    en: "A gift in your cart is no longer available. Remove it and try again.",
  },
  orderFailed: { he: "שליחת ההזמנה נכשלה, נסו שוב", fr: "La commande a échoué, réessayez", en: "Order failed, please try again" },
  tabCoupons: { he: "קופונים", fr: "Codes promo", en: "Coupons" },
  tabSettings: { he: "הגדרות", fr: "Réglages", en: "Settings" },
  adminNote: { he: "הערה פנימית (רק את רואה)", fr: "Note interne", en: "Internal note" },
  saved: { he: "נשמר", fr: "Enregistré", en: "Saved" },
  deliverBy: { he: "למסירה עד", fr: "Livrer le", en: "Deliver by" },
  printLetters: { he: "הדפסת מכתבים", fr: "Imprimer les lettres", en: "Print letters" },
  printLabel: { he: "הדפסת תווית משלוח", fr: "Imprimer l'étiquette", en: "Print shipping label" },
  moveUp: { he: "הזזה למעלה", fr: "Monter", en: "Move up" },
  moveDown: { he: "הזזה למטה", fr: "Descendre", en: "Move down" },
  couponPercent: { he: "אחוז הנחה", fr: "Pourcentage", en: "Percent off" },
  couponFixed: { he: "סכום קבוע (₪)", fr: "Montant fixe (₪)", en: "Fixed amount (₪)" },
  couponAmount: { he: "גובה ההנחה", fr: "Valeur", en: "Amount" },
  couponExpires: { he: "בתוקף עד (לא חובה)", fr: "Expire le (facultatif)", en: "Expires on (optional)" },
  addCoupon: { he: "הוספת קופון", fr: "Ajouter un code", en: "Add coupon" },
  couponActive: { he: "פעיל", fr: "Actif", en: "Active" },
  couponExpired: { he: "פג תוקף", fr: "Expiré", en: "Expired" },
  couponExists: { he: "קופון עם הקוד הזה כבר קיים", fr: "Ce code existe déjà", en: "That code already exists" },
  noCoupons: { he: "אין עדיין קופונים", fr: "Aucun code promo", en: "No coupons yet" },
  shippingFeeLabel: { he: "דמי משלוח להזמנה (₪)", fr: "Frais de livraison (₪)", en: "Shipping fee per order (₪)" },
  letterBackgrounds: { he: "רקעים להדפסת מכתבים", fr: "Fonds pour l'impression des lettres", en: "Letter print backgrounds" },
  letterBackgroundsHint: {
    he: "רק את רואה אותם. בזמן הדפסת המכתבים בוחרים רקע. מומלץ תמונה בגודל A4 לאורך.",
    fr: "Visibles par vous seule. Choisissez un fond lors de l'impression. Idéalement au format A4 portrait.",
    en: "Only you see these. Pick one when printing letters. A4 portrait works best.",
  },
  addBackground: { he: "הוספת רקע", fr: "Ajouter un fond", en: "Add background" },
  background: { he: "רקע", fr: "Fond", en: "Background" },
  noBackground: { he: "ללא", fr: "Aucun", en: "None" },
  cookieText: {
    he: "אנחנו משתמשים בעוגיות (Google Analytics) כדי להבין איך משתמשים באתר ולשפר אותו. אפשר לאשר או לסרב.",
    fr: "Nous utilisons des cookies (Google Analytics) pour comprendre l'utilisation du site et l'améliorer. Vous pouvez accepter ou refuser.",
    en: "We use cookies (Google Analytics) to understand how the site is used and improve it. You can accept or decline.",
  },
  cookieAccept: { he: "אישור", fr: "Accepter", en: "Accept" },
  cookieDecline: { he: "לא, תודה", fr: "Refuser", en: "Decline" },
  privacyTitle: { he: "מדיניות פרטיות", fr: "Politique de confidentialité", en: "Privacy policy" },
  privacyUpdated: { he: "עודכן לאחרונה", fr: "Dernière mise à jour", en: "Last updated" },
  privacyEmailPending: { he: "(כתובת המייל תתווסף בקרוב)", fr: "(adresse e-mail bientôt disponible)", en: "(email address coming soon)" },
  privacyMore: { he: "למדיניות הפרטיות", fr: "Politique de confidentialité", en: "Privacy policy" },
  holidayDaysLeft: { he: "עוד {n} ימים ל{holiday}", fr: "Plus que {n} jours avant {holiday}", en: "{n} days to {holiday}" },
  holidayOrderBy: {
    he: "הזמינו עד {date} כדי שהמתנה תגיע בזמן",
    fr: "Commandez avant le {date} pour une livraison à temps",
    en: "Order by {date} so the gift arrives in time",
  },
  holidayLastDay: {
    he: "היום הוא היום האחרון להזמין כדי שהמתנה תגיע בזמן!",
    fr: "Dernier jour pour commander et recevoir à temps !",
    en: "Today is the last day to order for on-time delivery!",
  },
  holidayShop: { he: "למתנות ←", fr: "Voir les cadeaux →", en: "See the gifts →" },
  close: { he: "סגירה", fr: "Fermer", en: "Close" },
  drawerLetterHint: {
    he: "את המכתב האישי לכל מתנה כותבים בסל",
    fr: "La lettre personnelle de chaque cadeau s'écrit dans le panier",
    en: "You'll write each gift's personal letter in the cart",
  },
  drawerToCart: { he: "לסל ולכתיבת המכתבים", fr: "Panier et lettres", en: "Cart & letters" },
  drawerContinue: { he: "להמשיך לבחור מתנות", fr: "Continuer mes achats", en: "Keep shopping" },
  greetingIdeas: { he: "רעיונות לברכה", fr: "Idées de message", en: "Greeting ideas" },
  youMayLike: { he: "אולי תאהבו גם", fr: "Vous aimerez aussi", en: "You may also like" },
  zoomImage: { he: "הגדלת התמונה", fr: "Agrandir l'image", en: "Enlarge image" },
  finderTitle: { he: "עזרו לי לבחור", fr: "Aidez-moi à choisir", en: "Help me choose" },
  finderStep: { he: "שאלה {n} מתוך 3", fr: "Question {n} sur 3", en: "Question {n} of 3" },
  finderWho: { he: "למי המתנה?", fr: "Pour qui est le cadeau ?", en: "Who is the gift for?" },
  finderOccasion: { he: "לאיזה אירוע?", fr: "Pour quelle occasion ?", en: "What's the occasion?" },
  finderBudget: { he: "מה התקציב?", fr: "Quel budget ?", en: "What's your budget?" },
  finderBack: { he: "חזרה", fr: "Retour", en: "Back" },
  finderResults: { he: "מצאנו לכם כמה מתנות מושלמות", fr: "Voici des cadeaux parfaits pour vous", en: "We found some perfect gifts" },
  finderNear: {
    he: "לא מצאנו התאמה מדויקת, אבל אלה קרובות מאוד",
    fr: "Pas de correspondance exacte, mais ceux-ci s'en approchent",
    en: "No exact match, but these come close",
  },
  finderRestart: { he: "להתחיל מחדש", fr: "Recommencer", en: "Start over" },
  finderNone: { he: "עדיין אין מתנות מתאימות.", fr: "Pas encore de cadeaux correspondants.", en: "No matching gifts yet." },
  finderCtaTitle: { he: "לא בטוחים מה לבחור?", fr: "Vous hésitez ?", en: "Not sure what to pick?" },
  finderCtaText: {
    he: "ענו על 3 שאלות קצרות ונמצא לכם את המתנה המתאימה",
    fr: "Répondez à 3 petites questions et nous trouverons le cadeau idéal",
    en: "Answer 3 quick questions and we'll find the right gift",
  },
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
  letterN: { he: "מכתב למתנה מס׳ {n}", fr: "Lettre pour le cadeau n° {n}", en: "Letter for gift #{n}" },
  letterNote: {
    he: "יודפס על נייר יוקרתי",
    fr: "Imprimée sur papier de luxe",
    en: "Printed on fine paper",
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
  phone: { he: "טלפון השולח", fr: "Téléphone de l'expéditeur", en: "Sender's phone" },
  phoneNote: {
    he: "נשתמש בו רק אם תהיה תקלה בהזמנה",
    fr: "Utilisé uniquement en cas de problème avec la commande",
    en: "Used only if there's a problem with the order",
  },
  recipientTitle: { he: "למי מיועדת המתנה?", fr: "À qui est destiné le cadeau ?", en: "Who is the gift for?" },
  recipientName: { he: "שם מקבל המתנה", fr: "Nom du destinataire", en: "Recipient's name" },
  recipientPhone: { he: "טלפון מקבל המתנה", fr: "Téléphone du destinataire", en: "Recipient's phone" },
  recipientPhoneNote: {
    he: "למקרה שהשליח לא מוצא את הכתובת או שאין מי שיקבל את המשלוח",
    fr: "Au cas où le livreur ne trouve pas l'adresse ou que personne ne soit là",
    en: "In case the courier can't find the address or no one is home",
  },
  recipient: { he: "מקבל המתנה", fr: "Destinataire", en: "Recipient" },
  shippingTitle: { he: "כתובת למשלוח המתנה", fr: "Adresse de livraison", en: "Shipping address" },
  street: { he: "רחוב", fr: "Rue", en: "Street" },
  houseNumber: { he: "מספר בית", fr: "Numéro", en: "House number" },
  israel: { he: "ישראל", fr: "Israël", en: "Israel" },
  city: { he: "עיר", fr: "Ville", en: "City" },
  country: { he: "מדינה", fr: "Pays", en: "Country" },
  lettersTitle: { he: "מכתב לכל מתנה", fr: "Une lettre par cadeau", en: "A letter for each gift" },
  paymentTitle: { he: "פרטי אשראי", fr: "Carte bancaire", en: "Card details" },
  cardNumber: { he: "מספר כרטיס", fr: "Numéro de carte", en: "Card number" },
  expiry: { he: "תוקף", fr: "Expiration", en: "Expiry" },
  cvv: { he: "CVV", fr: "CVV", en: "CVV" },
  cardHolder: { he: "שם בעל הכרטיס", fr: "Titulaire", en: "Cardholder" },
  placeOrder: { he: "שליחת המתנה", fr: "Envoyer le cadeau", en: "Send the gift" },
  orderDoneOne: {
    he: "אנחנו רצים להכין את המתנה שלכם!",
    fr: "Nous courons préparer votre cadeau !",
    en: "We're rushing to prepare your gift!",
  },
  orderDoneMany: {
    he: "אנחנו רצים להכין את המתנות שלכם!",
    fr: "Nous courons préparer vos cadeaux !",
    en: "We're rushing to prepare your gifts!",
  },
  orderTrack: {
    he: "תוכלו לעקוב אחרי סטטוס ההזמנה באזור האישי שלכם",
    fr: "Vous pouvez suivre le statut de votre commande dans votre espace personnel",
    en: "You can track your order status in your account",
  },
  orderTrackGuest: {
    he: "בפעם הבאה, התחברו לפני ההזמנה ותוכלו לעקוב אחרי הסטטוס שלה באזור האישי",
    fr: "La prochaine fois, connectez-vous avant de commander pour suivre son statut dans votre espace",
    en: "Next time, sign in before ordering to track its status in your account",
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
