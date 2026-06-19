import { t, type Locale } from "./i18n";

export type DeliveryMethodId = "avia" | "cargo" | "ems" | "domestic";

const METHOD_I18N: Record<DeliveryMethodId, string> = {
  avia: "delivery.avia",
  cargo: "delivery.cargo",
  ems: "delivery.ems",
  domestic: "delivery.domesticKr",
};

const METHOD_DESC_I18N: Record<DeliveryMethodId, string> = {
  avia: "delivery.aviaDesc",
  cargo: "delivery.cargoDesc",
  ems: "delivery.emsDesc",
  domestic: "delivery.domesticDesc",
};

const METHOD_EXCEL: Record<DeliveryMethodId, string> = {
  avia: "авиа",
  cargo: "карго",
  ems: "EMS",
  domestic: "внутри страны",
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

const METHOD_DEFS: Record<CountryRegion, DeliveryMethodId[]> = {
  kazakhstan: ["avia", "cargo"],
  europe: ["ems"],
  korea: ["domestic"],
  other: ["ems"],
};

const PRICE_NOTE: Partial<Record<DeliveryMethodId, string>> = {
  avia: "9",
  cargo: "4",
};

/** Canonical Russian names used in orders / detectRegion fallback */
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

const COUNTRY_IDS = [
  "kazakhstan", "southKorea", "russia", "uzbekistan", "kyrgyzstan",
  "germany", "france", "italy", "spain", "poland", "netherlands",
  "belgium", "austria", "czechia", "sweden", "finland", "denmark",
  "norway", "portugal", "greece", "hungary", "romania", "bulgaria",
  "croatia", "slovakia", "slovenia", "lithuania", "latvia", "estonia",
  "ireland", "luxembourg", "malta", "cyprus", "switzerland", "uk",
] as const;

const EUROPE_IDS = new Set(COUNTRY_IDS.slice(5));

function regionForCountryId(id: (typeof COUNTRY_IDS)[number]): CountryRegion {
  if (id === "kazakhstan") return "kazakhstan";
  if (id === "southKorea") return "korea";
  if (EUROPE_IDS.has(id)) return "europe";
  return "other";
}

export function getCountries(locale: Locale): string[] {
  return COUNTRY_IDS.map((id) => t(`country.${id}`, locale));
}

function localizeMethod(id: DeliveryMethodId, locale: Locale): DeliveryMethod {
  const price = PRICE_NOTE[id];
  return {
    id,
    label: deliveryMethodLabel(id, locale),
    labelExcel: METHOD_EXCEL[id],
    description: t(METHOD_DESC_I18N[id], locale),
    priceNote: price ? t("delivery.pricePerKg", locale, { price }) : undefined,
  };
}

export function detectRegion(country: string): CountryRegion {
  const c = country.trim().toLowerCase();
  for (const id of COUNTRY_IDS) {
    for (const loc of ["ru", "en", "ko"] as Locale[]) {
      if (t(`country.${id}`, loc).toLowerCase() === c) return regionForCountryId(id);
    }
  }
  if (c.includes("казахстан") || c === "kz" || c.includes("kazakhstan")) return "kazakhstan";
  if (c.includes("korea") || c.includes("кorea") || c.includes("коре")) return "korea";
  if (EUROPE_COUNTRIES.some((e) => e.toLowerCase() === c)) return "europe";
  return "other";
}

export function getDeliveryMethods(country: string, locale: Locale = "ru"): DeliveryMethod[] {
  const region = detectRegion(country);
  return METHOD_DEFS[region].map((id) => localizeMethod(id, locale));
}

export function methodById(country: string, id: DeliveryMethodId, locale: Locale = "ru"): DeliveryMethod | undefined {
  return getDeliveryMethods(country, locale).find((m) => m.id === id);
}

export function defaultMethod(country: string, locale: Locale = "ru"): DeliveryMethod {
  return getDeliveryMethods(country, locale)[0];
}
