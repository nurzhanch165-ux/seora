export const site = {
  name: "SEORA",
  fullName: "SEORA — корейская косметика и здоровье",
  description:
    "Прямые поставки косметики и нутрицевтиков из Южной Кореи. Оригинальная продукция, бережная доставка по всему миру.",
  currency: "₸",
  currencyCode: "KZT",
  locale: "ru-RU",
  contacts: {
    whatsapp: "+7 (700) 000-00-00",
    whatsappLink: "https://wa.me/77000000000",
    telegram: "@seora_korea",
    telegramLink: "https://t.me/seora_korea",
    instagram: "@seora.korea",
    instagramLink: "https://instagram.com/seora.korea",
    tiktok: "@seora.korea",
    tiktokLink: "https://tiktok.com/@seora.korea",
    youtube: "SEORA Korea",
    youtubeLink: "https://youtube.com/@seora.korea",
    email: "hello@seora.kr",
    koreaPhone: "+82 10-0000-0000",
    address: "Республика Корея, г. Сеул — склад отправки",
  },
  payment: {
    bank: "Kaspi Bank",
    cardNumber: "4400 0000 0000 0000",
    cardHolder: "SEORA TRADE",
    note: "После оплаты загрузите скриншот в личном кабинете — менеджер подтвердит заказ.",
  },
  shippingNote:
    "Отправки на склад формируются дважды в неделю. После подтверждения оплаты заказ попадает в ближайшую отгрузку.",
};

export type SiteConfig = typeof site;
