import type { LegalSection } from "@/components/LegalPage";

// Drafts for legal review. {email}, {phone}, {shipping} and {coordinator}
// are filled from the admin settings.
export const LEGAL_UPDATED = "2026-10-13";

export const termsSections: LegalSection[] = [
  {
    title: { he: "כללי", fr: "Généralités", en: "General" },
    body: [
      {
        he: "האתר \"מתנות\" מאפשר להזמין מתנות עם מכתב אישי ולשלוח אותן לכתובות בישראל. השימוש באתר וביצוע הזמנה מהווים הסכמה לתקנון זה, למדיניות המשלוחים ולמדיניות הפרטיות.",
        fr: "Le site « Matanot » permet de commander des cadeaux accompagnés d'une lettre personnelle et de les envoyer à des adresses en Israël. Utiliser le site et passer commande vaut acceptation des présentes conditions, de la politique de livraison et de la politique de confidentialité.",
        en: "The Matanot website lets you order gifts with a personal letter and send them to addresses in Israel. Using the site and placing an order means you accept these terms, the shipping policy and the privacy policy.",
      },
    ],
  },
  {
    title: { he: "הזמנות ומחירים", fr: "Commandes et prix", en: "Orders and prices" },
    body: [
      {
        he: "ההזמנה נקלטת אחרי אישור התשלום, ותקבלו אישור במסך ההזמנה. המחירים באתר נקבעים בשקלים וכוללים את כל המסים החלים, אם חלים. דמי משלוח מוצגים לפני התשלום.",
        fr: "La commande est enregistrée après confirmation du paiement, et une confirmation s'affiche à l'écran. Les prix sont fixés en shekels, toutes taxes applicables comprises. Les frais de livraison sont indiqués avant le paiement.",
        en: "An order is placed once payment is confirmed, and a confirmation appears on screen. Prices are set in shekels and include any applicable taxes. Shipping is shown before payment.",
      },
      {
        he: "מי שבוחר להציג מחירים ולשלם ביורו או בדולר מחויב לפי השער היציג של בנק ישראל ביום ההזמנה, כפי שמוצג בעמוד התשלום. עמלות המרה של חברת האשראי של הלקוח, אם יש, אינן באחריותנו.",
        fr: "En euros ou en dollars, le montant est calculé au taux officiel de la Banque d'Israël du jour de la commande, comme indiqué sur la page de paiement. Les éventuels frais de change de votre banque ne relèvent pas de notre responsabilité.",
        en: "If you choose euros or dollars, you are charged at the Bank of Israel representative rate on the order date, as shown at checkout. Any conversion fees from your card issuer are not our responsibility.",
      },
      {
        he: "התמונות באתר להמחשה בלבד. ייתכנו הבדלים קלים בגוון, באריזה או בפרטים, ואם מוצר אזל ייתכן שנציע מוצר חלופי בשווי זהה, רק בהסכמתכם.",
        fr: "Les photos sont indicatives. De légères différences de teinte, d'emballage ou de détails sont possibles. Si un article est épuisé, nous pourrons proposer un équivalent de même valeur, uniquement avec votre accord.",
        en: "Photos are for illustration. Slight differences in colour, packaging or details may occur. If an item runs out, we may offer an equivalent of the same value, only with your consent.",
      },
    ],
  },
  {
    title: { he: "המכתב האישי", fr: "La lettre personnelle", en: "The personal letter" },
    body: [
      {
        he: "האחריות לתוכן המכתב היא של המזמין. אנחנו מדפיסים את המכתב כפי שנכתב, ושומרים לעצמנו את הזכות שלא להדפיס תוכן פוגעני או שאינו הולם.",
        fr: "Le contenu de la lettre relève de la responsabilité de l'expéditeur. Nous l'imprimons tel qu'il est écrit et pouvons refuser un contenu offensant ou inapproprié.",
        en: "The sender is responsible for the letter's content. We print it as written and may decline offensive or inappropriate content.",
      },
    ],
  },
  {
    title: { he: "ביטול הזמנה", fr: "Annulation", en: "Cancellation" },
    body: [
      {
        he: "אפשר לבטל הזמנה ללא עלות כל עוד המתנה טרם נשלחה, בפנייה אלינו: {email}.",
        fr: "Une commande peut être annulée sans frais tant que le cadeau n'a pas été expédié, en nous écrivant : {email}.",
        en: "You can cancel free of charge as long as the gift hasn't shipped, by writing to us: {email}.",
      },
      {
        he: "לאחר המשלוח, ביטול ייעשה בהתאם לחוק הגנת הצרכן, התשמ\"א-1981, ולתקנות לפיו, כולל דמי ביטול בשיעור שהחוק מתיר. לפי החוק, אין זכות ביטול על מוצרי מזון ועל מוצרים שיוצרו או הותאמו במיוחד לבקשת הלקוח.",
        fr: "Après expédition, l'annulation se fait conformément à la loi israélienne sur la protection du consommateur (1981) et à ses règlements, y compris les frais d'annulation autorisés. La loi exclut le droit d'annulation pour les denrées alimentaires et les produits fabriqués ou personnalisés à la demande du client.",
        en: "After shipping, cancellation follows the Israeli Consumer Protection Law, 1981, and its regulations, including the cancellation fee the law allows. By law there is no right to cancel food products or items made or personalised at the customer's request.",
      },
    ],
  },
  {
    title: { he: "אחריות על המוצרים", fr: "Garantie", en: "Product warranty" },
    body: [
      {
        he: "המוצרים נמכרים כפי שהם. האתר אינו מעניק אחריות למוצרים, למעט מה שמחויב על פי דין.",
        fr: "Les produits sont vendus en l'état. Le site n'offre aucune garantie sur les produits, sauf ce que la loi impose.",
        en: "Products are sold as they are. The site gives no warranty on the products, except as required by law.",
      },
      {
        he: "מתנה שהגיעה פגומה או שבורה: יש לדווח לנו תוך 48 שעות מהמסירה, עם תמונה, ונציע החלפה או החזר.",
        fr: "Cadeau arrivé abîmé ou cassé : signalez-le-nous dans les 48 heures suivant la livraison, avec une photo, et nous proposerons un échange ou un remboursement.",
        en: "Gift arrived damaged or broken: tell us within 48 hours of delivery, with a photo, and we'll offer a replacement or refund.",
      },
    ],
  },
  {
    title: { he: "הגבלת אחריות", fr: "Limitation de responsabilité", en: "Limitation of liability" },
    body: [
      {
        he: "איננו אחראים לעיכובים שנגרמו בגלל חברת המשלוחים, פרטי כתובת שגויים, היעדר מענה מצד המקבל, או נסיבות שאינן בשליטתנו.",
        fr: "Nous ne sommes pas responsables des retards dus au transporteur, à une adresse erronée, à l'absence du destinataire ou à des circonstances indépendantes de notre volonté.",
        en: "We're not responsible for delays caused by the courier, wrong address details, the recipient not answering, or circumstances beyond our control.",
      },
    ],
  },
  {
    title: { he: "דין וסמכות שיפוט", fr: "Droit applicable", en: "Governing law" },
    body: [
      {
        he: "על התקנון חלים דיני מדינת ישראל, והסמכות הבלעדית נתונה לבתי המשפט המוסמכים בישראל.",
        fr: "Les présentes conditions sont régies par le droit israélien ; les tribunaux compétents en Israël ont compétence exclusive.",
        en: "These terms are governed by Israeli law, and the competent courts in Israel have exclusive jurisdiction.",
      },
    ],
  },
  {
    title: { he: "יצירת קשר", fr: "Contact", en: "Contact" },
    body: [
      {
        he: "מייל: {email} · וואטסאפ: {phone}",
        fr: "E-mail : {email} · WhatsApp : {phone}",
        en: "Email: {email} · WhatsApp: {phone}",
      },
    ],
  },
];

export const shippingSections: LegalSection[] = [
  {
    title: { he: "לאן שולחים", fr: "Destinations", en: "Where we ship" },
    body: [
      {
        he: "המשלוחים הם לכתובות בישראל בלבד. אפשר להזמין מכל מקום בעולם.",
        fr: "Nous livrons uniquement en Israël. Vous pouvez commander depuis n'importe où dans le monde.",
        en: "We ship to addresses in Israel only. You can order from anywhere in the world.",
      },
    ],
  },
  {
    title: { he: "זמני משלוח", fr: "Délais", en: "Delivery times" },
    body: [
      {
        he: "אנחנו מתחייבים לשלוח את המתנה תוך 7 ימי עסקים (ראשון עד חמישי) מרגע ההזמנה. אפשר לבחור תאריך מסירה רצוי בעמוד התשלום.",
        fr: "Nous nous engageons à expédier le cadeau dans les 7 jours ouvrés (du dimanche au jeudi) suivant la commande. Vous pouvez choisir une date de livraison souhaitée lors du paiement.",
        en: "We commit to shipping within 7 business days (Sunday to Thursday) of the order. You can pick a preferred delivery date at checkout.",
      },
      {
        he: "לפני חגים כדאי להזמין מוקדם. באתר מופיע התאריך האחרון להזמנה כדי שהמתנה תגיע לפני החג. ימי חג ושבת אינם ימי עסקים.",
        fr: "Avant les fêtes, commandez tôt : le site indique la dernière date pour une livraison avant la fête. Les fêtes et le Chabbat ne sont pas des jours ouvrés.",
        en: "Before holidays, order early: the site shows the last day to order for delivery before the holiday. Holidays and Shabbat are not business days.",
      },
    ],
  },
  {
    title: { he: "דמי משלוח", fr: "Frais de livraison", en: "Shipping cost" },
    body: [
      {
        he: "דמי המשלוח הם {shipping} להזמנה, לכתובת אחת, ללא קשר למספר המתנות.",
        fr: "Les frais de livraison sont de {shipping} par commande, pour une adresse, quel que soit le nombre de cadeaux.",
        en: "Shipping is {shipping} per order, to one address, however many gifts it contains.",
      },
    ],
  },
  {
    title: { he: "המסירה", fr: "La remise", en: "Delivery" },
    body: [
      {
        he: "השליח יוצר קשר עם מקבל המתנה בטלפון שמסרתם. חשוב לוודא שהכתובת ומספר הטלפון נכונים.",
        fr: "Le livreur contacte le destinataire au numéro indiqué. Vérifiez bien l'adresse et le téléphone.",
        en: "The courier contacts the recipient on the phone number you gave. Please make sure the address and phone are correct.",
      },
      {
        he: "אם המשלוח לא נמסר בגלל כתובת שגויה או היעדר מענה, נתאם מסירה חוזרת. מסירה חוזרת עשויה להיות כרוכה בתשלום נוסף.",
        fr: "Si la livraison échoue à cause d'une adresse erronée ou d'une absence de réponse, nous organiserons une nouvelle livraison, qui peut entraîner des frais supplémentaires.",
        en: "If delivery fails because of a wrong address or no answer, we'll arrange another attempt, which may cost extra.",
      },
    ],
  },
  {
    title: { he: "מעקב ובעיות", fr: "Suivi et problèmes", en: "Tracking and problems" },
    body: [
      {
        he: "לקוחות רשומים יכולים לעקוב אחרי סטטוס ההזמנה באזור האישי.",
        fr: "Les clients inscrits peuvent suivre l'état de leur commande dans leur espace.",
        en: "Registered customers can follow their order status in their account.",
      },
      {
        he: "מתנה שהגיעה פגומה: יש לדווח תוך 48 שעות מהמסירה, עם תמונה, ל־{email} או בוואטסאפ {phone}.",
        fr: "Cadeau abîmé : signalez-le dans les 48 heures, avec une photo, à {email} ou sur WhatsApp {phone}.",
        en: "Damaged gift: report it within 48 hours, with a photo, to {email} or on WhatsApp {phone}.",
      },
    ],
  },
];

export const a11ySections: LegalSection[] = [
  {
    title: { he: "המחויבות שלנו", fr: "Notre engagement", en: "Our commitment" },
    body: [
      {
        he: "אנחנו רוצים שכל אחד יוכל לבחור ולשלוח מתנה בקלות. האתר הותאם בהתאם לתקן הישראלי ת\"י 5568, המבוסס על הנחיות WCAG 2.0 ברמה AA, ואנחנו ממשיכים לשפר אותו.",
        fr: "Nous voulons que chacun puisse choisir et envoyer un cadeau facilement. Le site a été adapté selon la norme israélienne 5568, fondée sur les WCAG 2.0 niveau AA, et nous continuons à l'améliorer.",
        en: "We want everyone to be able to choose and send a gift easily. The site has been adapted to Israeli Standard 5568, based on WCAG 2.0 level AA, and we keep improving it.",
      },
    ],
  },
  {
    title: { he: "מה עשינו", fr: "Ce que nous avons fait", en: "What we did" },
    body: [
      {
        he: "אפשר לנווט באתר במקלדת בלבד, עם סימון ברור של הרכיב הפעיל וקישור \"דלגו לתוכן\" בראש כל עמוד.",
        fr: "Le site se parcourt entièrement au clavier, avec un repère visible sur l'élément actif et un lien « Aller au contenu » en haut de chaque page.",
        en: "The site can be used with a keyboard alone, with a clear marker on the active element and a \"skip to content\" link at the top of every page.",
      },
      {
        he: "לתמונות יש טקסט חלופי, לשדות הטפסים יש תוויות, וצבעי הטקסט נבחרו לניגודיות קריאה על הרקע.",
        fr: "Les images ont un texte alternatif, les champs des formulaires ont des libellés, et les couleurs du texte sont choisies pour un contraste lisible.",
        en: "Images have alternative text, form fields have labels, and text colours were chosen for readable contrast.",
      },
      {
        he: "האתר מותאם לטלפונים ולהגדלת טקסט בדפדפן, זמין בעברית, בצרפתית ובאנגלית, ומכבד את הגדרת \"הפחתת תנועה\" במכשיר.",
        fr: "Le site s'adapte aux téléphones et au zoom du navigateur, existe en hébreu, français et anglais, et respecte le réglage « réduire les animations ».",
        en: "The site works on phones and with browser zoom, is available in Hebrew, French and English, and respects the device's \"reduce motion\" setting.",
      },
    ],
  },
  {
    title: { he: "נתקלתם בבעיה?", fr: "Un problème ?", en: "Found a problem?" },
    body: [
      {
        he: "אם משהו באתר לא נגיש לכם, נשמח לשמוע ולתקן. רכז/ת הנגישות: {coordinator} · מייל: {email} · טלפון: {phone}.",
        fr: "Si quelque chose n'est pas accessible pour vous, dites-le-nous et nous corrigerons. Référent·e accessibilité : {coordinator} · e-mail : {email} · téléphone : {phone}.",
        en: "If anything on the site isn't accessible to you, let us know and we'll fix it. Accessibility coordinator: {coordinator} · email: {email} · phone: {phone}.",
      },
    ],
  },
];
