import type { L } from "./i18n";

// Ready-made greetings offered under the letter box. `for` lists the gift
// categories a greeting suits; those come first for a matching gift.
export type Greeting = { for: string[]; title: L; text: L };

export const greetings: Greeting[] = [
  {
    for: ["rosh-hashana"],
    title: { he: "ראש השנה", fr: "Roch Hachana", en: "Rosh Hashanah" },
    text: {
      he: "שנה טובה ומתוקה! מאחלים לכם שנה של בריאות, שמחה וכל טוב.",
      fr: "Chana Tova ouMetouka ! Nous vous souhaitons une année de santé, de joie et de bonheur.",
      en: "Shana Tova uMetuka! Wishing you a year of health, joy and every good thing.",
    },
  },
  {
    for: ["sukkot"],
    title: { he: "סוכות", fr: "Souccot", en: "Sukkot" },
    text: {
      he: "חג סוכות שמח! שתזכו לחג מלא שמחה ואור.",
      fr: "Bonne fête de Souccot ! Que cette fête soit pleine de joie et de lumière.",
      en: "Happy Sukkot! May your holiday be full of joy and light.",
    },
  },
  {
    for: ["hanukkah"],
    title: { he: "חנוכה", fr: "Hanouka", en: "Hanukkah" },
    text: {
      he: "חנוכה שמח! שהאור של הנרות ימלא את הבית שלכם בשמחה ובחום.",
      fr: "Hanouka Saméah ! Que la lumière des bougies remplisse votre maison de joie et de chaleur.",
      en: "Happy Hanukkah! May the light of the candles fill your home with joy and warmth.",
    },
  },
  {
    for: ["tu-bishvat"],
    title: { he: "ט״ו בשבט", fr: "Tou Bichvat", en: "Tu BiShvat" },
    text: {
      he: "ט״ו בשבט שמח! שתמשיכו לצמוח ולפרוח.",
      fr: "Joyeux Tou Bichvat ! Continuez à grandir et à fleurir.",
      en: "Happy Tu BiShvat! Keep growing and blossoming.",
    },
  },
  {
    for: ["purim"],
    title: { he: "פורים", fr: "Pourim", en: "Purim" },
    text: {
      he: "פורים שמח! משלוח מנות קטן עם הרבה אהבה.",
      fr: "Pourim Saméah ! Un petit michloah manot avec beaucoup d'amour.",
      en: "Happy Purim! A little mishloach manot with lots of love.",
    },
  },
  {
    for: ["pesach"],
    title: { he: "פסח", fr: "Pessah", en: "Passover" },
    text: {
      he: "חג פסח כשר ושמח! מאחלים לכם חג של חירות, משפחה ושמחה.",
      fr: "Pessah Cacher vé Saméah ! Une fête de liberté, de famille et de joie.",
      en: "Chag Pesach Kasher veSameach! A holiday of freedom, family and joy.",
    },
  },
  {
    for: ["shavuot"],
    title: { he: "שבועות", fr: "Chavouot", en: "Shavuot" },
    text: {
      he: "חג שבועות שמח! מאחלים לכם חג מלא שמחה וברכה.",
      fr: "Bonne fête de Chavouot ! Une fête pleine de joie et de bénédictions.",
      en: "Happy Shavuot! Wishing you a holiday full of joy and blessing.",
    },
  },
  {
    for: ["shabbat", "judaica"],
    title: { he: "שבת", fr: "Chabbat", en: "Shabbat" },
    text: {
      he: "שבת שלום ומבורכת! חשבנו עליכם ורצינו לשמח.",
      fr: "Chabbat Chalom ! Nous avons pensé à vous et voulions vous faire plaisir.",
      en: "Shabbat Shalom! We were thinking of you and wanted to bring you some joy.",
    },
  },
  {
    for: ["birthday-child", "birthday-teen", "birthday-adult", "for-boy", "for-girl"],
    title: { he: "יום הולדת", fr: "Anniversaire", en: "Birthday" },
    text: {
      he: "מזל טוב ליום ההולדת! מאחלים לך שנה מלאה בשמחה, בריאות והצלחה.",
      fr: "Joyeux anniversaire ! Nous te souhaitons une année pleine de joie, de santé et de réussite.",
      en: "Happy birthday! Wishing you a year full of joy, health and success.",
    },
  },
  {
    for: ["baby"],
    title: { he: "לרך הנולד", fr: "Naissance", en: "New baby" },
    text: {
      he: "מזל טוב! שתזכו לגדל את הרך הנולד לתורה, לחופה ולמעשים טובים.",
      fr: "Mazal Tov ! Puissiez-vous élever ce bébé dans la Torah, jusqu'à la 'houppa, et dans les bonnes actions.",
      en: "Mazal Tov! May you raise your little one to Torah, to the chuppah and to good deeds.",
    },
  },
  {
    for: ["bar-mitzvah", "for-boy"],
    title: { he: "בר מצווה", fr: "Bar Mitsva", en: "Bar Mitzvah" },
    text: {
      he: "מזל טוב לבר המצווה! שתזכה לגדול בתורה ובמעשים טובים ולשמח את כל המשפחה.",
      fr: "Mazal Tov pour ta Bar Mitsva ! Que tu grandisses dans la Torah et les bonnes actions, pour la joie de toute la famille.",
      en: "Mazal Tov on your Bar Mitzvah! May you grow in Torah and good deeds and bring joy to the whole family.",
    },
  },
  {
    for: ["bat-mitzvah", "for-girl"],
    title: { he: "בת מצווה", fr: "Bat Mitsva", en: "Bat Mitzvah" },
    text: {
      he: "מזל טוב לבת המצווה! שתזכי לגדול במעשים טובים ולהיות לשמחה לכל המשפחה.",
      fr: "Mazal Tov pour ta Bat Mitsva ! Que tu grandisses dans les bonnes actions, pour la joie de toute la famille.",
      en: "Mazal Tov on your Bat Mitzvah! May you grow in good deeds and be a joy to the whole family.",
    },
  },
  {
    for: [],
    title: { he: "תודה", fr: "Merci", en: "Thank you" },
    text: {
      he: "תודה רבה מכל הלב! רצינו לומר לכם כמה אתם חשובים לנו.",
      fr: "Merci du fond du cœur ! Nous voulions vous dire combien vous comptez pour nous.",
      en: "Thank you from the bottom of our hearts! We wanted to tell you how much you mean to us.",
    },
  },
  {
    for: [],
    title: { he: "סתם כי בא לי", fr: "Juste comme ça", en: "Just because" },
    text: {
      he: "חשבנו עליכם ורצינו לשלוח קצת שמחה. מתגעגעים ואוהבים!",
      fr: "Nous avons pensé à vous et voulions vous envoyer un peu de joie. Vous nous manquez, on vous aime !",
      en: "We were thinking of you and wanted to send a little joy. Missing you and sending love!",
    },
  },
];

// Greetings for a gift: those matching its categories first, then the rest.
export const greetingsFor = (categories: string[] = []) => {
  const match = (g: Greeting) => g.for.some((c) => categories.includes(c));
  return [...greetings.filter(match), ...greetings.filter((g) => !match(g))];
};
