import type { L } from "./i18n";

// Contact address shown in the privacy policy. Fill in before publishing.
export const PRIVACY_CONTACT_EMAIL = "";
// Date the policy was last updated (shown at the top).
export const PRIVACY_UPDATED = "2026-10-08";

type Section = { title: L; body: L[] };

export const privacySections: Section[] = [
  {
    title: { he: "מי אנחנו", fr: "Qui sommes-nous", en: "Who we are" },
    body: [
      {
        he: "האתר \"מתנות\" מאפשר לשלוח מתנות עם מכתב אישי לנמענים בישראל. מדיניות זו מסבירה איזה מידע אנחנו אוספים, למה, ומה הזכויות שלכם לגביו.",
        fr: "Le site « Matanot » permet d'envoyer des cadeaux accompagnés d'une lettre personnelle à des destinataires en Israël. Cette politique explique quelles données nous collectons, pourquoi, et quels sont vos droits.",
        en: "The Matanot website lets you send gifts with a personal letter to recipients in Israel. This policy explains what information we collect, why, and what your rights are.",
      },
    ],
  },
  {
    title: { he: "איזה מידע אנחנו אוספים", fr: "Les données que nous collectons", en: "Information we collect" },
    body: [
      {
        he: "פרטי ההזמנה: שם השולח וטלפון, שם מקבל המתנה, טלפון וכתובת למשלוח, המכתבים שצירפתם, הערות להזמנה, תאריך מסירה רצוי וקוד קופון אם הוזן.",
        fr: "Les données de commande : nom et téléphone de l'expéditeur, nom, téléphone et adresse du destinataire, les lettres jointes, les remarques, la date de livraison souhaitée et le code promo éventuel.",
        en: "Order details: the sender's name and phone, the recipient's name, phone and delivery address, the letters you attach, order notes, the preferred delivery date and any coupon code.",
      },
      {
        he: "חשבון באתר (לא חובה): כתובת מייל וסיסמה. הסיסמה נשמרת מוצפנת ואיננו יכולים לראות אותה.",
        fr: "Compte (facultatif) : adresse e-mail et mot de passe. Le mot de passe est stocké chiffré et nous ne pouvons pas le voir.",
        en: "Account (optional): email address and password. The password is stored encrypted and we cannot see it.",
      },
      {
        he: "סטטיסטיקת שימוש באתר דרך Google Analytics, רק אם אישרתם עוגיות (ראו בהמשך).",
        fr: "Des statistiques de fréquentation via Google Analytics, uniquement si vous acceptez les cookies (voir plus bas).",
        en: "Site usage statistics through Google Analytics, only if you accept cookies (see below).",
      },
      {
        he: "איננו שומרים פרטי כרטיס אשראי. כשיחובר תשלום מקוון, הוא יתבצע בעמוד מאובטח של חברת סליקה.",
        fr: "Nous ne conservons pas les données de carte bancaire. Le paiement en ligne, une fois activé, se fera sur la page sécurisée d'un prestataire de paiement.",
        en: "We do not store card details. Once online payment is enabled, it will take place on a payment provider's secure page.",
      },
    ],
  },
  {
    title: { he: "למה אנחנו משתמשים במידע", fr: "Pourquoi nous utilisons ces données", en: "Why we use it" },
    body: [
      {
        he: "כדי להכין ולשלוח את המתנה, להדפיס את המכתב, ליצור קשר במקרה של תקלה במשלוח, ולאפשר לכם לעקוב אחרי ההזמנה באזור האישי.",
        fr: "Pour préparer et livrer le cadeau, imprimer la lettre, vous contacter en cas de problème de livraison et vous permettre de suivre la commande dans votre espace.",
        en: "To prepare and deliver the gift, print the letter, contact you if there is a delivery problem, and let you track the order in your account.",
      },
      {
        he: "סטטיסטיקת השימוש עוזרת לנו להבין אילו עמודים ומתנות מעניינים ולשפר את האתר. איננו מוכרים מידע אישי לאף אחד.",
        fr: "Les statistiques nous aident à comprendre quelles pages et quels cadeaux intéressent et à améliorer le site. Nous ne vendons aucune donnée personnelle.",
        en: "Usage statistics help us understand which pages and gifts interest people and improve the site. We never sell personal information.",
      },
    ],
  },
  {
    title: { he: "עם מי המידע משותף", fr: "Avec qui les données sont partagées", en: "Who we share it with" },
    body: [
      {
        he: "ספקי שירות שהאתר נשען עליהם: שירות האחסון ומסד הנתונים של האתר, שירות שליחת מיילים להתראות על הזמנות, ו-Google Analytics (רק בהסכמתכם). שליח או חברת משלוחים יקבלו את שם המקבל, הטלפון והכתובת לצורך המסירה בלבד.",
        fr: "Les prestataires sur lesquels repose le site : hébergement et base de données, service d'envoi d'e-mails pour les notifications de commande, et Google Analytics (avec votre accord). Le livreur reçoit le nom, le téléphone et l'adresse du destinataire uniquement pour la livraison.",
        en: "The service providers the site relies on: hosting and database, an email service for order notifications, and Google Analytics (only with your consent). The courier receives the recipient's name, phone and address for delivery only.",
      },
      {
        he: "חלק מהספקים האלה מעבדים מידע מחוץ לישראל ולאיחוד האירופי, בהתאם לתנאים שלהם.",
        fr: "Certains de ces prestataires traitent des données en dehors d'Israël et de l'Union européenne, selon leurs propres conditions.",
        en: "Some of these providers process data outside Israel and the European Union, under their own terms.",
      },
    ],
  },
  {
    title: { he: "עוגיות ואחסון בדפדפן", fr: "Cookies et stockage du navigateur", en: "Cookies and browser storage" },
    body: [
      {
        he: "האתר שומר בדפדפן שלכם את סל הקניות, את השפה שבחרתם ואת ההתחברות לחשבון. אלה נחוצים כדי שהאתר יעבוד.",
        fr: "Le site enregistre dans votre navigateur le panier, la langue choisie et la connexion au compte. Ces éléments sont nécessaires au fonctionnement du site.",
        en: "The site stores your cart, chosen language and account sign-in in your browser. These are needed for the site to work.",
      },
      {
        he: "עוגיות של Google Analytics נטענות רק אחרי שאישרתם בחלונית ההסכמה. מי שסירב יישאל שוב בביקור הבא, ותמיד אפשר לסרב.",
        fr: "Les cookies Google Analytics ne sont chargés qu'après votre accord dans la fenêtre de consentement. En cas de refus, la question sera reposée lors d'une prochaine visite, et vous pouvez toujours refuser.",
        en: "Google Analytics cookies load only after you accept in the consent window. If you decline, you'll be asked again on a later visit, and you can always decline.",
      },
    ],
  },
  {
    title: { he: "כמה זמן אנחנו שומרים מידע", fr: "Durée de conservation", en: "How long we keep it" },
    body: [
      {
        he: "פרטי הזמנות נשמרים כל עוד הם נחוצים לטיפול בהזמנה, לשירות לקוחות ולחובות חשבונאיות לפי הדין. אפשר לבקש מחיקה של חשבון ומידע שאינו נדרש עוד.",
        fr: "Les données de commande sont conservées tant qu'elles sont nécessaires au traitement, au service client et aux obligations comptables légales. Vous pouvez demander la suppression d'un compte et des données qui ne sont plus nécessaires.",
        en: "Order details are kept as long as needed to handle the order, provide customer service and meet legal accounting duties. You can ask us to delete an account and data that is no longer needed.",
      },
    ],
  },
  {
    title: { he: "הזכויות שלכם", fr: "Vos droits", en: "Your rights" },
    body: [
      {
        he: "אתם רשאים לבקש לעיין במידע שלכם, לתקן אותו, למחוק אותו או להגביל את השימוש בו, וכן לבטל הסכמה לעוגיות. מבקרים מהאיחוד האירופי זכאים גם להגיש תלונה לרשות הגנת המידע במדינתם.",
        fr: "Vous pouvez demander l'accès à vos données, leur rectification, leur suppression ou la limitation de leur usage, et retirer votre consentement aux cookies. Les visiteurs de l'Union européenne peuvent aussi saisir l'autorité de protection des données de leur pays (en France, la CNIL).",
        en: "You may ask to access, correct, delete or restrict the use of your information, and withdraw your cookie consent. Visitors from the European Union may also complain to their national data protection authority.",
      },
    ],
  },
  {
    title: { he: "יצירת קשר", fr: "Contact", en: "Contact" },
    body: [
      {
        he: "לכל שאלה או בקשה בנוגע למידע שלכם, כתבו לנו: {email}",
        fr: "Pour toute question ou demande concernant vos données, écrivez-nous : {email}",
        en: "For any question or request about your information, write to us: {email}",
      },
    ],
  },
];
