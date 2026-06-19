import { t, type Locale } from "./i18n";

export type DeliveryMethodId = "avia" | "cargo" | "ems" | "domestic";

const METHOD_I18N: Record<DeliveryMethodId, string> = {
  avia: "delivery.avia",
  cargo: "delivery.cargo",
  ems: "delivery.ems",
  domestic: "delivery.domesticKr",
};

export function deliveryMethodLabel(id: DeliveryMethodId, locale: Locale): string {
  return t(METHOD_I18N[id], locale);
}

export type DeliveryMethod = {
  id: DeliveryMethodId;
  label: string;
  labelExcel: string;
  description: string;
  priceNote?: string;
};

export type CountryRegion = "kazakhstan" | "europe" | "korea" | "other";

const KZ: DeliveryMethod[] = [
  { id: "avia", label: "Авиа (K)", labelExcel: "авиа", description: "Быстрая авиадоставка", priceNote: "9 $/кг" },
  { id: "cargo", label: "Карго (CK)", labelExcel: "карго", description: "Экономичная карго-доставка", priceNote: "4 $/кг" },
];

const EU: DeliveryMethod[] = [
  { id: "ems", label: "EMS", labelExcel: "EMS", description: "Международная почта EMS из Южной Кореи" },
];

const KR: DeliveryMethod[] = [
  { id: "domestic", label: "Доставка по Корее", labelExcel: "внутри страны", description: "Доставка внутри Южной Кореи" },
];

const OTHER: DeliveryMethod[] = [
  { id: "ems", label: "EMS", labelExcel: "EMS", description: "Международная почта EMS" },
];

export const EUROPE_COUNTRIES = [
  "Германия", "Франция", "Италия", "Испания", "Польша", "Нидерланды",
  "Бельгия", "Австрия", "Чехия", "Швеция", "Финляндия", "Дания",
  "Норвегия", "Португалия", "Греция", "Венгрия", "Румыния", "Болгария",
  "Хорватия", "Словакия", "Словения", "Литва", "Латвия", "Эстония",
  "Ирландия", "Люксембург", "Мальта", "Кипр", "Швейцария", "Великобритания",
];

export const COUNTRIES = [
  "Казахстан", "Южная Корея", "Россия", "Узбекистан", "Кыргызстан",
  ...EUROPE_COUNTRIES,
];

export function detectRegion(country: string): CountryRegion {
  const c = country.trim().toLowerCase();
  if (c.includes("казахстан") || c === "kz") return "kazakhstan";
  if (c.includes("кorea") || c.includes("кorea") || c.includes("коре")) return "korea";
  if (EUROPE_COUNTRIES.some((e) => e.toLowerCase() === c)) return "europe";
  return "other";
}

export function getDeliveryMethods(country: string): DeliveryMethod[] {
  switch (detectRegion(country)) {
    case "kazakhstan": return KZ;
    case "europe": return EU;
    case "korea": return KR;
    default: return OTHER;
  }
}

export function methodById(country: string, id: DeliveryMethodId): DeliveryMethod | undefined {
  return getDeliveryMethods(country).find((m) => m.id === id);
}

export function defaultMethod(country: string): DeliveryMethod {
  return getDeliveryMethods(country)[0];
}
