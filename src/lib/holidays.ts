import { addBusinessDays, SHIP_WITHIN_BUSINESS_DAYS } from "./orders";

// Holidays with a gift category, by Hebrew date. Purim falls in Adar II in leap years.
const HOLIDAYS: { slug: string; day: number; months: string[] }[] = [
  { slug: "rosh-hashana", day: 1, months: ["Tishri"] },
  { slug: "sukkot", day: 15, months: ["Tishri"] },
  { slug: "hanukkah", day: 25, months: ["Kislev"] },
  { slug: "tu-bishvat", day: 15, months: ["Shevat"] },
  { slug: "purim", day: 14, months: ["Adar", "Adar II"] },
  { slug: "pesach", day: 15, months: ["Nisan"] },
  { slug: "shavuot", day: 6, months: ["Sivan"] },
];

// The browser's built-in Hebrew calendar, so no yearly date list to maintain.
const hebrewParts = new Intl.DateTimeFormat("en-u-ca-hebrew", { day: "numeric", month: "long" });

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export type UpcomingHoliday = {
  slug: string;
  date: Date;
  daysLeft: number;
  // Last day to order so the gift arrives before the holiday starts.
  orderBy: Date;
  daysToOrder: number;
};

// The next holiday whose ordering window is still open and that starts within
// `withinDays` days, or null.
export function upcomingHoliday(today = new Date(), withinDays = 45): UpcomingHoliday | null {
  const start = startOfDay(today);
  for (let i = 0; i <= withinDays; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const parts = hebrewParts.formatToParts(date);
    const day = Number(parts.find((p) => p.type === "day")?.value);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const h = HOLIDAYS.find((x) => x.day === day && x.months.includes(month));
    if (!h) continue;

    // Holidays begin the evening before, so the gift should arrive by then.
    const eve = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    const orderBy = new Date(eve);
    while (orderBy >= start && addBusinessDays(orderBy, SHIP_WITHIN_BUSINESS_DAYS) > eve)
      orderBy.setDate(orderBy.getDate() - 1);
    // Never name Shabbat as the deadline; Friday ships just as fast.
    if (orderBy.getDay() === 6) orderBy.setDate(orderBy.getDate() - 1);
    if (orderBy < start) continue; // too late for this one; look further ahead
    return {
      slug: h.slug,
      date,
      daysLeft: i,
      orderBy,
      daysToOrder: Math.round((orderBy.getTime() - start.getTime()) / 86400000),
    };
  }
  return null;
}
