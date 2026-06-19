export type Locale = "ru" | "en" | "ko";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "ru", label: "Русский", flag: "RU" },
  { code: "en", label: "English", flag: "EN" },
  { code: "ko", label: "한국어", flag: "KR" },
];

type Dict = Record<string, string>;

const ru: Dict = {
  "nav.catalog": "Каталог",
  "nav.streams": "Стримы",
  "nav.delivery": "Доставка",
  "nav.cart": "Корзина",
  "nav.account": "Кабинет",
  "cart.added": "Товар добавлен в корзину",
  "cart.go": "Перейти в корзину",
  "cart.continue": "Продолжить покупки",
  "hero.cta": "Перейти в каталог",
  "hero.register": "Регистрация",
  "home.about.title": "О компании",
  "home.categories.title": "Что можно купить",
  "home.why.title": "Почему выбирают нас",
  "home.how.title": "Как сделать заказ",
  "stream.closed": "Продажи по этому стриму закрыты",
  "stream.timer": "Осталось для заказа",
  "product.outOfStock": "Закончился",
  "product.addToCart": "Добавить в корзину",
};

const en: Dict = {
  "nav.catalog": "Catalog",
  "nav.streams": "Streams",
  "nav.delivery": "Delivery",
  "nav.cart": "Cart",
  "nav.account": "Account",
  "cart.added": "Added to cart",
  "cart.go": "Go to cart",
  "cart.continue": "Continue shopping",
  "hero.cta": "Browse catalog",
  "hero.register": "Sign up",
  "home.about.title": "About us",
  "home.categories.title": "What you can buy",
  "home.why.title": "Why choose us",
  "home.how.title": "How to order",
  "stream.closed": "Stream sales are closed",
  "stream.timer": "Time left to order",
  "product.outOfStock": "Out of stock",
  "product.addToCart": "Add to cart",
};

const ko: Dict = {
  "nav.catalog": "카탈로그",
  "nav.streams": "스트림",
  "nav.delivery": "배송",
  "nav.cart": "장바구니",
  "nav.account": "계정",
  "cart.added": "장바구니에 추가되었습니다",
  "cart.go": "장바구니로",
  "cart.continue": "쇼핑 계속",
  "hero.cta": "카탈로그 보기",
  "hero.register": "회원가입",
  "home.about.title": "회사 소개",
  "home.categories.title": "구매 가능 상품",
  "home.why.title": "선택 이유",
  "home.how.title": "주문 방법",
  "stream.closed": "스트림 판매 종료",
  "stream.timer": "주문 가능 시간",
  "product.outOfStock": "품절",
  "product.addToCart": "장바구니 담기",
};

const dicts: Record<Locale, Dict> = { ru, en, ko };

export function t(key: string, locale: Locale): string {
  return dicts[locale][key] ?? dicts.ru[key] ?? key;
}
