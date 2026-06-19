export const site = {
  name: "SonyShopKorea",
  fullName: "SonyShopKorea — корейская косметика и здоровье",
  description:
    "Прямые поставки косметики и нутрицевтиков из Южной Кореи. Оригинальная продукция, бережная доставка по всему миру.",
  currency: "₩",
  currencyCode: "KRW",
  locale: "ru-RU",
  contacts: {
    whatsapp: "+7 (700) 000-00-00",
    whatsappLink: "https://wa.me/77000000000",
    telegram: "@sonyshopkorea",
    telegramLink: "https://t.me/sonyshopkorea",
    instagram: "@sonyshopkorea",
    instagramLink: "https://instagram.com/sonyshopkorea",
    tiktok: "@sonyshopkorea",
    tiktokLink: "https://tiktok.com/@sonyshopkorea",
    youtube: "SonyShopKorea",
    youtubeLink: "https://youtube.com/@sonyshopkorea",
    email: "hello@sonyshopkorea.com",
    koreaPhone: "+82 10-0000-0000",
    address: "Республика Корея, г. Сеул — склад отправки",
  },
  payment: {
    bank: "Kaspi Bank",
    cardNumber: "4400 0000 0000 0000",
    cardHolder: "SONYSHOPKOREA TRADE",
    note: "После оплаты загрузите скриншот в личном кабинете — менеджер подтвердит заказ.",
  },
  shippingNote:
    "Отправки на склад формируются дважды в неделю. После подтверждения оплаты заказ попадает в ближайшую отгрузку.",
};

export type SiteConfig = typeof site;
