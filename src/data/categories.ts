export type IconKey =
  | "Droplet"
  | "Jar"
  | "Mask"
  | "Cleanser"
  | "Lipstick"
  | "Device"
  | "Man"
  | "Woman"
  | "Leaf"
  | "Pill"
  | "Eye"
  | "Scale"
  | "Tea"
  | "Sparkle"
  | "Shield"
  | "HealthHeart"
  | "Bone"
  | "Stomach";

export type SubCategory = { slug: string; name: string };
export type Category = { slug: string; name: string; icon: IconKey; subs: SubCategory[] };
export type Section = {
  slug: "cosmetics" | "health";
  name: string;
  tagline: string;
  categories: Category[];
};

export const sections: Section[] = [
  {
    slug: "cosmetics",
    name: "Косметика",
    tagline: "Уход и макияж из Южной Кореи",
    categories: [
      {
        slug: "ampuly-syvorotki",
        name: "Ампулы и сыворотки",
        icon: "Droplet",
        subs: [
          { slug: "vitaminnye", name: "Витаминные ампулы" },
          { slug: "lifting", name: "Лифтинг-ампулы" },
          { slug: "kollagenovye", name: "Коллагеновые ампулы" },
          { slug: "glutationovye", name: "Глютатионовые ампулы" },
          { slug: "protiv-pigmentacii", name: "Против пигментации" },
          { slug: "protiv-morshchin", name: "Против морщин" },
          { slug: "omolazhivayushchie", name: "Омолаживающие" },
          { slug: "uvlazhnenie", name: "Для увлажнения" },
          { slug: "siyanie", name: "Для сияния кожи" },
          { slug: "stvolovye-kletki", name: "Со стволовыми клетками" },
        ],
      },
      {
        slug: "kremy",
        name: "Кремы",
        icon: "Jar",
        subs: [
          { slug: "stvolovye-kletki", name: "Со стволовыми клетками" },
          { slug: "kollagenovye", name: "Коллагеновые" },
          { slug: "lifting", name: "Лифтинг-кремы" },
          { slug: "protiv-morshchin", name: "Против морщин" },
          { slug: "ot-pigmentacii", name: "От пигментации" },
          { slug: "uvlazhnyayushchie", name: "Увлажняющие" },
          { slug: "pitatelnye", name: "Питательные" },
          { slug: "dlya-glaz", name: "Для глаз" },
          { slug: "solncezashchitnye", name: "Солнцезащитные" },
          { slug: "nochnye", name: "Ночные" },
          { slug: "dnevnye", name: "Дневные" },
        ],
      },
      {
        slug: "maski",
        name: "Маски",
        icon: "Mask",
        subs: [
          { slug: "gidrogelevye", name: "Гидрогелевые" },
          { slug: "vitaminnye", name: "Витаминные" },
          { slug: "kollagenovye", name: "Коллагеновые" },
          { slug: "glutationovye", name: "Глютатионовые" },
          { slug: "lifting", name: "Лифтинг-маски" },
          { slug: "protiv-pigmentacii", name: "Против пигментации" },
          { slug: "uvlazhnyayushchie", name: "Увлажняющие" },
          { slug: "tkanevye", name: "Тканевые" },
          { slug: "siyanie", name: "Для сияния кожи" },
        ],
      },
      {
        slug: "ochishchenie",
        name: "Очищение кожи",
        icon: "Cleanser",
        subs: [
          { slug: "gidrofilnoe-maslo", name: "Гидрофильное масло" },
          { slug: "penki", name: "Пенки для умывания" },
          { slug: "geli", name: "Гели для умывания" },
          { slug: "pilingi", name: "Пилинги" },
          { slug: "skraby", name: "Скрабы" },
          { slug: "ochishchayushchie-balzamy", name: "Очищающие бальзамы" },
          { slug: "tonery", name: "Тонеры" },
        ],
      },
      {
        slug: "dekorativnaya",
        name: "Декоративная косметика",
        icon: "Lipstick",
        subs: [
          { slug: "pomady", name: "Помады" },
          { slug: "tinty", name: "Тинты" },
          { slug: "kushony", name: "Кушоны" },
          { slug: "tonalnye", name: "Тональные кремы" },
          { slug: "pudry", name: "Пудры" },
          { slug: "bazy", name: "Базы под макияж" },
          { slug: "konsilery", name: "Консилеры" },
        ],
      },
      {
        slug: "muzhskaya",
        name: "Мужская косметика",
        icon: "Man",
        subs: [
          { slug: "kremy", name: "Мужские кремы" },
          { slug: "posle-britya", name: "После бритья" },
          { slug: "uhod-za-licom", name: "Уход за кожей лица" },
          { slug: "shampuni", name: "Шампуни" },
          { slug: "ot-vypadeniya-volos", name: "От выпадения волос" },
        ],
      },
      {
        slug: "zhenskaya",
        name: "Женская косметика",
        icon: "Woman",
        subs: [
          { slug: "uhod-za-licom", name: "Уход за лицом" },
          { slug: "uhod-za-telom", name: "Уход за телом" },
          { slug: "uhod-za-volosami", name: "Уход за волосами" },
          { slug: "antivozrastnoy", name: "Антивозрастной уход" },
          { slug: "premialnaya", name: "Премиальная косметика" },
        ],
      },
      {
        slug: "apparaty",
        name: "Аппараты и массажёры",
        icon: "Device",
        subs: [
          { slug: "galvanik", name: "Гальваник для лица" },
          { slug: "massazhery", name: "Массажёры для лица" },
          { slug: "rollery", name: "Роллеры" },
          { slug: "lifting-apparaty", name: "Аппараты для лифтинга" },
          { slug: "domashniy-uhod", name: "Для домашнего ухода" },
        ],
      },
    ],
  },
  {
    slug: "health",
    name: "Всё для здоровья",
    tagline: "БАДы и нутрицевтики из Кореи",
    categories: [
      {
        slug: "pechen",
        name: "Для печени",
        icon: "Stomach",
        subs: [
          { slug: "rastoropsha", name: "Расторопша" },
          { slug: "ochishchenie", name: "Очищение печени" },
          { slug: "detoks", name: "Детокс-препараты" },
          { slug: "vosstanovlenie", name: "Восстановление печени" },
        ],
      },
      {
        slug: "sustavy",
        name: "Для суставов и костей",
        icon: "Bone",
        subs: [
          { slug: "kalciy", name: "Кальций" },
          { slug: "magniy", name: "Магний" },
          { slug: "vitamin-d", name: "Витамин D" },
          { slug: "cink", name: "Цинк" },
          { slug: "kompleksy", name: "Кальций + магний + D" },
          { slug: "msm", name: "МСМ" },
          { slug: "glyukozamin", name: "Глюкозамин" },
          { slug: "hondroitin", name: "Хондроитин" },
          { slug: "bychiy-hryashch", name: "Бычий хрящ" },
          { slug: "dlya-sustavov", name: "Для суставов" },
          { slug: "dlya-kostey", name: "Для костей" },
        ],
      },
      {
        slug: "glaza",
        name: "Для глаз",
        icon: "Eye",
        subs: [
          { slug: "lyutein", name: "Лютеин" },
          { slug: "zeaksantin", name: "Зеаксантин" },
          { slug: "vitaminy-zrenie", name: "Витамины для зрения" },
          { slug: "zashchita-glaz", name: "Защита глаз" },
        ],
      },
      {
        slug: "pohudenie",
        name: "Для похудения",
        icon: "Scale",
        subs: [
          { slug: "chai", name: "Чаи для похудения" },
          { slug: "zhele", name: "Желе для похудения" },
          { slug: "detoks-napitki", name: "Детокс-напитки" },
          { slug: "obmen-veshchestv", name: "Для обмена веществ" },
          { slug: "ochishchenie-organizma", name: "Очищение организма" },
        ],
      },
      {
        slug: "chai",
        name: "Чаи",
        icon: "Tea",
        subs: [
          { slug: "tykvennyy", name: "Тыквенный чай" },
          { slug: "detoks", name: "Детокс-чай" },
          { slug: "pohudenie", name: "Для похудения" },
          { slug: "pechen", name: "Для печени" },
          { slug: "zhenskoe-zdorove", name: "Женское здоровье" },
          { slug: "ot-otyokov", name: "От отёков" },
          { slug: "drugie", name: "Другие корейские чаи" },
        ],
      },
      {
        slug: "kollagen",
        name: "Коллаген",
        icon: "Sparkle",
        subs: [
          { slug: "stiki", name: "В стиках" },
          { slug: "zhele", name: "В желе" },
          { slug: "poroshok", name: "В порошке" },
          { slug: "vishnya", name: "С вишней" },
          { slug: "aloe", name: "С алоэ" },
          { slug: "granat", name: "С гранатом" },
          { slug: "rybnyy", name: "Рыбный коллаген" },
          { slug: "premialnyy", name: "Премиальный" },
        ],
      },
      {
        slug: "glutation",
        name: "Глютатион",
        icon: "Droplet",
        subs: [
          { slug: "stiki", name: "В стиках" },
          { slug: "tabletki", name: "В таблетках" },
          { slug: "zhele", name: "Глютатион-желе" },
          { slug: "dlya-kozhi", name: "Для кожи" },
          { slug: "siyanie", name: "Для сияния кожи" },
        ],
      },
      {
        slug: "zhenskoe",
        name: "Женское здоровье",
        icon: "Woman",
        subs: [
          { slug: "probiotiki", name: "Пробиотики" },
          { slug: "vitaminy", name: "Витамины для женщин" },
          { slug: "gormonalnyy-balans", name: "Гормональный баланс" },
          { slug: "kozha-volosy-nogti", name: "Кожа, волосы, ногти" },
        ],
      },
      {
        slug: "muzhskoe",
        name: "Мужское здоровье",
        icon: "Man",
        subs: [
          { slug: "prostata", name: "Для простаты" },
          { slug: "energiya", name: "Мужская энергия" },
          { slug: "vitaminy", name: "Витамины для мужчин" },
          { slug: "cink", name: "Цинк" },
          { slug: "kompleksy", name: "Комплексы" },
        ],
      },
      {
        slug: "immunitet",
        name: "Иммунитет",
        icon: "Shield",
        subs: [
          { slug: "vitamin-c", name: "Витамин C" },
          { slug: "vitamin-d", name: "Витамин D" },
          { slug: "cink", name: "Цинк" },
          { slug: "probiotiki", name: "Пробиотики" },
          { slug: "multivitaminy", name: "Мультивитамины" },
          { slug: "zhenshen", name: "Женьшень" },
          { slug: "albumin", name: "Альбумин" },
          { slug: "omega-3", name: "Омега-3" },
        ],
      },
      {
        slug: "serdce",
        name: "Сердце и сосуды",
        icon: "HealthHeart",
        subs: [
          { slug: "omega-3", name: "Омега-3" },
          { slug: "koenzim-q10", name: "Коэнзим Q10" },
          { slug: "sosudy", name: "Для сосудов" },
          { slug: "holesterin", name: "Для холестерина" },
          { slug: "kurkumin", name: "Куркумин" },
          { slug: "olivkovoe-maslo", name: "Оливковое масло в капсулах" },
        ],
      },
    ],
  },
];

export function getSection(slug: string): Section | undefined {
  return sections.find((s) => s.slug === slug);
}

export function getCategory(sectionSlug: string, categorySlug: string) {
  const section = getSection(sectionSlug);
  return section?.categories.find((c) => c.slug === categorySlug);
}

export function allCategories(): { section: Section; category: Category }[] {
  return sections.flatMap((section) =>
    section.categories.map((category) => ({ section, category }))
  );
}
