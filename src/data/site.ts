export const site = {
  name: "SonyShopKorea",
  fullName: "SonyShopKorea — корейская косметика и здоровье",
  description:
    "Прямые поставки косметики и нутрицевтиков из Южной Кореи. Оригинальная продукция, бережная доставка по всему миру.",
  currency: "₩",
  currencyCode: "KRW",
  locale: "ru-RU",
  contacts: {
    whatsapp: "+82 10-4409-8203",
    whatsappLink: "https://wa.me/821044098203",
    telegram: "@sonyshopkorea",
    telegramLink: "https://t.me/sonyshopkorea",
    instagram: "@sonyshopkorea",
    instagramLink: "https://instagram.com/sonyshopkorea",
    tiktok: "@sonyshopkorea",
    tiktokLink: "https://tiktok.com/@sonyshopkorea",
    youtube: "SonyShopKorea",
    youtubeLink: "https://youtube.com/@sonyshopkorea",
    email: "sonyshopkorea@gmail.com",
    koreaPhone: "+82 10-4409-8203",
    address: "Республика Корея, г. Сеул — склад отправки",
  },
  payment: {
    kazakhstan: {
      title: "KASPI GOLD",
      phone: "+77007703135",
      phoneHolder: "Аимгуль М",
      cardNumber: "4400 4302 0348 5906",
      cardHolder: "AIMGUL MUSSINA",
    },
    korea: {
      bank: "WOORI BANK (우리은행)",
      recipient: "MUSSINA BIBIGUL",
      accountNumber: "1002-761-434093",
    },
    note: "После оплаты загрузите скриншот в личном кабинете — менеджер подтвердит заказ.",
  },
  shippingNote:
    "Отправки на склад формируются дважды в неделю. После подтверждения оплаты заказ попадает в ближайшую отгрузку.",
};

export type SiteConfig = typeof site;
