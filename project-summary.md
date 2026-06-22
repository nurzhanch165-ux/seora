# SonyShopKorea — сводка проекта (handoff)

> Этот файл — краткое и полное описание проекта для продолжения работы в новом чате.
> Вставьте его содержимое в начало нового диалога, чтобы ассистент сразу понял контекст.
> **Последнее обновление:** 20 июня 2026 — сессия **10**: фиксы шапки, i18n админки + checkout, адрес склада, единый вход `/login`. **Production:** коммит `af253a3` на Vercel.

---

## 1. Задача проекта

Интернет-магазин товаров из Южной Кореи для клиентов из разных стран. Разделы каталога: **Косметика**, **Всё для здоровья**, **Товары для дома**, **Одежда**, **Обувь** (маршруты `/c/home`, `/c/clothes`, `/c/shoes` и т.д.).

Ключевой сценарий: клиент регистрируется → выбирает товары → корзина → оформление → **Excel-файл заказа** → оплата по реквизитам → скриншот → админ подтверждает → **общий Excel для склада** → отгрузка.

Особенности из ТЗ:
- Регистрация **по логину и паролю**, email необязателен.
- Статусы заказа и оплаты (см. `types.ts`).
- Карточка товара с расширенными полями.
- Ручная оплата на первом этапе.
- RU/EN/KO + KRW/KZT/USD/EUR с комиссией 3%.

Требования по дизайну: премиальный вид (Cold Luxury), без эмодзи, SVG-иконки.

**ТЗ (PDF):** `c:\Users\nurzh\Downloads\Техническое задание по доработке сайта SonyShopKorea.pdf`

---

## 2. Технологический стек

- **Next.js 14.2.5** (App Router) + **React 18.3** + **TypeScript 5.5**
- **Tailwind CSS 3.4** — дизайн-система Cold Luxury
- **Zustand 4.5** — корзина, избранное, auth, catalog, orders, preferences, exchangeRates
- **Supabase** (PostgreSQL + Storage)
- **xlsx (SheetJS) 0.18.5** — Excel (клиент + сервер)
- **server-only** — серверные модули
- Шрифты: **Onest** + **Manrope** (кириллица)

### Что где хранится

| Данные | Где |
|--------|-----|
| Каталог товаров | `products` (+ `sku`, `active`, **`i18n` jsonb**) |
| Клиенты | `customers` (+ `admin_comment`, `zip`, `address`) |
| Заказы | `orders`, `order_items` (+ source, stream, валюта, fee) |
| Фото товаров | Storage `product-images` |
| Скриншоты оплаты | Storage `payment-screenshots` |
| **Авто-Excel за день** | Storage `daily-exports` (приватный) |
| Корзина | `localStorage` `sonyshopkorea-cart` (+ **streamContext**) |
| Язык/валюта | `localStorage` `sonyshopkorea-prefs` + cookie `locale` |
| Переводы категорий | `src/lib/i18n/categoryLocales.json` (145 ключей EN/KO) |
| Переводы UI | `src/lib/i18n/messages.ts` + `adminMessages.ts` + `countryMessages.ts` |
| Курсы (кэш UI) | `store/exchangeRates.ts` (загрузка с API) |
| Стримы | `streams`, `stream_products` |
| Сессия админа | cookie `sonyshopkorea_admin` |

---

## 3. Продакшен: ссылки и аккаунты

### Сайт (Vercel)

- **Production:** https://sonyshopkorea.vercel.app
- Панель: https://vercel.com/nurzhan1/sonyshopkorea
- **Последний коммит на production:** `af253a3` — единый `/login`, i18n админки, фиксы шапки
- Предыдущие: `24abfa3` (i18n админки + checkout), `50622f7` (i18n клиент + авто-перевод товаров)

### GitHub

- https://github.com/nurzhanch165-ux/seora — ветка `main`, авто-деплой Vercel

### Supabase

- Project ref: `tmdakiocltbfjawkdwdw`
- URL: `https://tmdakiocltbfjawkdwdw.supabase.co`
- Панель: https://supabase.com/dashboard/project/tmdakiocltbfjawkdwdw

### Учётные данные

- **Админ:** `admin` / `admin123`
- **Клиент:** `/register`, `/login`

### Переменные окружения (`.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_LOGIN=admin
ADMIN_PASSWORD=admin123
CRON_SECRET=change-me-to-random-secret   # для Vercel Cron → /api/cron/daily-excel
TRANSLATE_API_EMAIL=                     # опционально: больше лимит MyMemory для перевода товаров
```

**На Vercel добавить:** `CRON_SECRET` (случайная строка) для работы cron. Опционально `TRANSLATE_API_EMAIL`.

**Supabase — применить миграции (если ещё не):**
- `supabase/migrations/20260619_daily_exports_bucket.sql` — bucket `daily-exports`
- `supabase/migrations/20260620_product_i18n.sql` — колонка `products.i18n jsonb`

---

## 4. Дизайн-система (Cold Luxury)

Палитра: `pearl` `#F6F5F2`, `ink` `#111318`, `accent` `#E84D7A`, `surface`, `mist`.

- Hero/фоны: `public/images/hero-korea.png`, `streams-bg.png`, `about-health.png`
- Классы: `.btn-primary`, `.btn-accent`, `.card`, `.icon-btn`, `.section-muted`
- Skills: `.agents/skills/design-taste-frontend/SKILL.md`

---

## 5. Архитектура бэкенда

### Миграции Supabase

| Файл | Статус |
|------|--------|
| `supabase/schema.sql` | применена |
| `20260619_streams_and_orders.sql` | применена |
| `20260619_daily_exports_bucket.sql` | bucket auto-Excel (**проверить на prod**) |
| `20260620_product_i18n.sql` | **`products.i18n jsonb`** — переводы EN/KO (**применить**) |

### API-роуты (`src/app/api/`)

| Роут | Назначение |
|------|------------|
| `POST /api/admin/login` … `upload` | Админ |
| `GET /api/admin/customers` | Клиентская база (список + история заказов) |
| `PATCH /api/admin/customers/[id]` | Комментарий админа к клиенту |
| `GET /api/admin/exports` | Список auto-Excel из Storage (signed URL) |
| `POST /api/admin/exports` | Ручной запуск генерации за сегодня (KST) |
| `GET /api/cron/daily-excel` | Cron (Bearer `CRON_SECRET`) — auto-Excel |
| `GET /api/currency/rates` | Живые курсы KRW→KZT/USD/EUR |
| `GET/POST /api/orders` … | Заказы |
| `PATCH /api/orders/[id]` | Статус, оплата, **adminComment** |
| `GET/POST/PATCH/DELETE /api/streams` … | Стримы (+ PATCH title/date/products) |
| `POST /api/seed` | Seed каталога |

### Cron (Vercel)

`vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/daily-excel", "schedule": "0 15 * * *" }] }
```
15:00 UTC ≈ полночь KST. Генерирует **`orders_*`**, **`items_total_*`**, **`warehouse_*`** → Storage.

---

## 6. Структура проекта (актуальная)

```
src/
  app/
    api/admin/customers/ … exports/ … products/ … cron/daily-excel/ … currency/rates/
    admin/page.tsx              вкладки: Заказы | Excel | Товары | Стримы | Клиенты (i18n)
    admin/login/page.tsx        redirect → /login?next=/admin (единый вход)
    login/page.tsx              клиент + админ (admin первым); редирект admin → /admin
    checkout/page.tsx           source stream + живые курсы + i18n стран/доставки
    delivery/page.tsx           → DeliveryPageClient
    streams/[id]/page.tsx
    page.tsx                    → HomePageContent (i18n)
    about/ … contacts/ …        client-компоненты с useT()
  components/
    admin/StreamEditor.tsx, ProductEditor.tsx
    about/AboutPageClient.tsx, contacts/ContactsPageClient.tsx
    brands/BrandsPageClient.tsx, BrandPageClient.tsx
    catalog/CatalogPageClient.tsx
    home/HomeHero.tsx, HomePageContent.tsx, HomeSectionHeading.tsx
    DeliveryPageClient.tsx, LocaleSync.tsx
    ExchangeRatesLoader.tsx
    Header.tsx, Footer.tsx, ProductCard.tsx, ProductDetail.tsx, LocaleCurrencyBar.tsx, …
  hooks/
    useTranslation.ts           useT(), useLocale(), useSiteText()
    useAdminSession.ts          проверка admin cookie без race (redirect)
    useLocalizedProduct.ts      локализованный Product по locale
  lib/
    excelCore.ts                buildWarehouseSheetAoa, buildOrderWorkbook, …
    excel.ts                    клиент: writeFile (async exportOrderExcel)
    excel.server.ts             generateAndUploadDailyExcel() + warehouse
    translate.server.ts         MyMemory API → EN/KO для товаров
    productI18n.ts              localizedProduct(), productFieldsFromProduct()
    catalogI18n.ts              sectionLabel, categoryLabel, subcategoryLabel
    i18n.ts                     t(), siteText(); merge messages + categoryLocales
    i18n/messages.ts            UI-ключи RU/EN/KO (+ merge admin + country)
    i18n/adminMessages.ts       ~150 ключей admin.* RU/EN/KO
    i18n/countryMessages.ts     country.* для checkout datalist (35 стран)
    i18n/categoryLocales.json   145 ключей cat.section.* / cat.category.* / cat.sub.*
    delivery.ts                 getDeliveryMethods(country, locale), getCountries(locale)
    exchangeRates.server.ts, currency.ts, types.ts, supabase/…
  store/
    cart.ts                     + streamContext
    catalog.ts, exchangeRates.ts, preferences.ts (+ cookie locale), …
  data/
    categories.ts               5 разделов
    products.ts                 + i18n?: ProductI18n
scripts/
  generate-category-i18n.ts       регенерация categoryLocales.json через MyMemory
vercel.json
supabase/migrations/
  20260619_streams_and_orders.sql
  20260619_daily_exports_bucket.sql
  20260620_product_i18n.sql
```

---

## 7. Авторизация

- **Клиенты:** RPC + bcrypt, Zustand + `localStorage`
- **Админ:** httpOnly cookie `sonyshopkorea_admin`, Zustand `useAdminAuth` (без persist)
- **Единый вход:** `/login` — сначала пробует admin, потом клиент
- **`/admin/login`:** только redirect на `/login?next=/admin` (отдельной формы нет)
- **Выход из админки:** кнопка «Выйти» → `/login` (не `/admin/login`)
- **Без сессии на `/admin`:** redirect → `/login?next=/admin`
- **Иконка профиля в шапке:** если admin logged in → `/admin`, иначе `/account` или `/login`
- **AccountShell:** ссылка «Перейти в админ-панель» при admin-сессии
- **Race fix:** `hooks/useAdminSession.ts` — ждёт свежий `GET /api/admin/me` перед redirect (не stale Zustand)
- **Учётные данные админа:** `ADMIN_LOGIN` / `ADMIN_PASSWORD` в env (по умолчанию admin / admin123)

---

## 8. Каталог и админка товаров

- **Витрина:** `useCatalogProducts()` — только `active !== false`; текст через `useLocalizedProduct()`
- **Админка:** `useCatalog((s) => s.products)` — все товары; интерфейс **переводится** (RU/EN/KO через `admin.*` ключи)
- **ProductEditor / StreamEditor:** полный i18n через `useT()`
- **ProductEditor:** SKU, active, цена KRW, остаток; админ вводит **только по-русски**
- **Авто-перевод при сохранении:** `POST /api/admin/products` → `buildProductI18n()` → колонка `i18n` (EN + KO)
- **Разделы:** cosmetics | health | home | clothes | shoes
- Seed: `npx tsx scripts/seed.ts` или `POST /api/seed`
- **Старые товары без переводов:** нужно **пересохранить** в админке (или написать batch-скрипт)

---

## 9. Заказы, Excel, валюта, стримы

### Заказы

- Номер: `SSK-YYMMDD-XXX`
- **source:** `catalog` | `stream` — из `cart.streamContext` при checkout
- Поля: `streamId`, `streamName`, `currencyCode`, `exchangeRate`, `totalKrw`, `totalConverted`, `feeAmount`, `adminComment`

### Корзина и стримы

- `store/cart.ts`: при добавлении со страницы стрима сохраняется `streamContext`
- Добавление из каталога (`ProductDetail`) передаёт `null` → сброс контекста
- Checkout показывает баннер «Заказ из стрима»

### Excel

| Слой | Файлы |
|------|-------|
| Ядро | `excelCore.ts` — `buildWarehouseSheetAoa` (общая таблица), `buildDailyOrdersWorkbook`, … |
| Клиент | `excel.ts` — `exportOrderExcel` (async), warehouse, daily, items_total |
| Сервер | `excel.server.ts` — upload в `daily-exports` (+ warehouse) |

**Формат склада** (как в рабочем Excel менеджера — скрин от 19.06):

| Элемент | Значение |
|---------|----------|
| Шапка | `ДАТА: 19.06` |
| Колонки (11) | Номер заказа, Имя клиента/고객명, Телефон/전화번호, № позиции, Товар/상품명, Кол-во, Цена ₩, Общее, Доставка, Адрес/배송지, Оплата |
| Цены | `₩ 20 000,00` (пробел тысяч, запятая копеек) |
| № позиции | номер в стриме (из `stream_products.position`) или 1,2,3… в заказе |
| Имя клиента | `FirstName LastName` |

| Экспорт | Файл | Примечание |
|---------|------|------------|
| **Формат склада** | `warehouse_*.xlsx` | **основной** для отгрузки; кнопка первая в админке |
| Общий за день | `orders_*.xlsx` | 31 колонка; комиссия 3% |
| Кол-во товаров | `items_total_*.xlsx` | остаток на складе |
| Заказ клиента | `order_{номер}_{имя}.xlsx` | **тот же формат склада**, 1 заказ |
| Cron (KST) | все три типа | `orders_*`, `items_total_*`, `warehouse_*` |

**Админка → Excel:**
- Первая кнопка: **warehouse_*.xlsx**
- Фильтр по дате, стриму, «только оплаченные»
- Блок **«Авто-Excel»** — ручной запуск + список из Storage

### Валюта

- База в БД: **KRW**
- **Живые курсы:** `GET /api/currency/rates` (open.er-api.com, кэш 1ч)
- `ExchangeRatesLoader` в `layout.tsx`
- `useDisplayPrice()` и checkout используют `convertFromKrw(price, currency, rates)`
- Комиссия **+3%** для KZT/USD/EUR

### Доставка

KZ: Авиа (K) 9$/кг, Карго (CK) 4$/кг | EU: EMS | KR: внутри страны

### Стримы

- Таймер 24ч после `ended_at`
- **StreamEditor** в админке: название, дата, товары с **price_override** и **stock**
- PATCH `/api/streams/[id]` — title, streamDate, endedAt, products[]

### i18n (полная локализация клиентского сайта)

| Компонент | Файл | Назначение |
|-----------|------|------------|
| UI-словарь | `lib/i18n/messages.ts` + `adminMessages.ts` + `countryMessages.ts` | клиент + админ + страны |
| Категории | `lib/i18n/categoryLocales.json` | 145 ключей `cat.section.*`, `cat.category.*`, `cat.sub.*` |
| Ядро | `lib/i18n.ts` | `t(key, locale)`, `siteText()` |
| Хуки | `hooks/useTranslation.ts` | `useT()`, `useLocale()`, `useSiteText()` |
| Товары | `hooks/useLocalizedProduct.ts` | подставляет `product.i18n[locale]` |
| Каталог | `lib/catalogI18n.ts` | названия разделов/категорий по locale |
| Синхронизация | `components/LocaleSync.tsx` + `preferences.ts` | cookie `locale`, `html lang` |
| Перевод товаров | `lib/translate.server.ts` | MyMemory `ru→en/ko` на сервере |

**Переведено (клиент):** Header, Footer, мега-меню, Cart, Checkout (+ success, **страны и способы доставки**), Auth, Account, About, Contacts (**+ адрес склада** `contacts.address`), Delivery, Search, Sale, Brands, Streams, Product detail, Catalog, Home, 404, PaymentUpload, статусы заказов.

**Переведено (админ):** все вкладки (`/admin`), ProductEditor, StreamEditor — ключи `admin.*` в `adminMessages.ts`.

**Исправлены переводы категорий (EN/KO):** `categoryLocales.json` — muzhskaya, tkanevye, interior, clothes, verh/niz и др. (убраны смешанные RU+EN строки).

**Не переводится намеренно:** Excel-заголовки (RU/KR формат склада), SEO metadata по умолчанию RU, **контент товаров** без `products.i18n` в БД.

**Переключатель:** шапка → RU / EN / KR + валюта KRW/KZT/USD/EUR.

**Регенерация категорий:**
```powershell
npx tsx scripts/generate-category-i18n.ts
```

---

## 10. Запуск и деплой

```powershell
cd "c:\Users\nurzh\Projects\каталог корейской косметики"
npm install
cp .env.example .env.local   # + CRON_SECRET локально для теста cron
npm run dev
npm run build                # Windows: полные права вне песочницы
```

**Деплой:**
```powershell
git add -A
git commit -m "feat: полная доработка ТЗ — Excel cron, курсы, i18n, стримы, клиенты"
git push
```

После push: `CRON_SECRET` на Vercel; миграции bucket + product i18n в Supabase.

---

## 11. История сессий (кратко)

| Сессия | Содержание |
|--------|------------|
| 1 | Supabase, миграция с localStorage, Vercel, GitHub |
| 2 | Фикс регистрации pgcrypto, Excel адрес, мобилка, админ checkout |
| 3 | Ребрендинг SEORA→SonyShopKorea, домен, мобильная вёрстка |
| 4 | ТЗ: Excel, главная, доставка, стримы, валюта (базово) |
| 5 | Cold Luxury редизайн, деплой `9233679`, фиксы шапки |
| **6** | См. **11-sexies** |
| **7** | См. **11-septies** |
| **8** | См. **11-octies** — Excel формат склада |
| **9** | См. **11-nonies** — полная i18n + авто-перевод товаров |
| **10** | См. **11-decies** — шапка, i18n админки, checkout, единый login |

---

## 11-sexies. Шестая сессия (19 июня 2026) — доработка ТЗ (часть 1)

1. **Заказы из стримов**
   - `store/cart.ts`: `streamContext { streamId, streamName }`
   - `ProductGrid`/`ProductCard`/`streams/[id]`: передача контекста при «В корзину»
   - `checkout`: `source: "stream"`, `streamId`, `streamName`

2. **Excel (доработка)**
   - Колонки: **Сумма до комиссии**, **Комиссия 3%**, **Итого с комиссией**
   - `items_total`: колонка **Остаток** из каталога
   - Фильтр и суффикс имени при выгрузке **по стриму**

3. **Клиентская база**
   - `GET /api/admin/customers`, `PATCH /api/admin/customers/[id]`
   - Админка → вкладка **«Клиенты»**: контакты, история заказов, комментарий

4. **Комментарий админа к заказам**
   - `PATCH /api/orders/[id]` — поле `adminComment`
   - UI textarea в раскрытом заказе

5. **Фиксы шапки** (из 11-quinquies C): мега-меню без сдвига, select языка на Windows

---

## 11-septies. Седьмая сессия (19 июня 2026) — доработка ТЗ (часть 2, финал)

1. **Авто-Excel каждый день**
   - `excelCore.ts` + `excel.server.ts`
   - `GET /api/cron/daily-excel` + `vercel.json` cron
   - `GET/POST /api/admin/exports` — список и ручной запуск
   - Storage bucket `daily-exports` (миграция SQL)

2. **Живые курсы валют**
   - `exchangeRates.server.ts` → open.er-api.com
   - `GET /api/currency/rates`
   - `store/exchangeRates.ts` + `ExchangeRatesLoader`
   - Checkout и `useDisplayPrice` на живых курсах

3. **i18n RU/EN/KO (~80 ключей)**
   - Header, Footer, Cart, ProductCard, Streams, Delivery, Hero главной
   - `hooks/useTranslation.ts`

4. **Редактирование стримов**
   - `components/admin/StreamEditor.tsx`
   - Цена стрима (KRW), остаток стрима, добавление/удаление товаров
   - PATCH streams: title, streamDate, endedAt

5. **Категории не-заглушки**
   - `categories.ts`: разделы `home`, `clothes`, `shoes`
   - Главная: ссылки `/c/home`, `/c/clothes`, `/c/shoes`

6. **SKU / active в товарах**
   - ProductEditor: артикул, чекбокс «активен»
   - `mapProductRow` / `productToRow`: `sku`, `active`
   - Витрина скрывает неактивные

7. **Cold Luxury в админке**
   - Токены `text-pearl`, `bg-pearl`; вкладка Клиенты; StreamEditor

**Сборка:** `npm run build` — OK (34 routes).

---

## 11-octies. Восьмая сессия (19 июня 2026) — Excel формат склада

**Коммит:** `ba18dec` → push на Vercel

1. **Формат склада** (`buildWarehouseWorkbook`) — как рабочий Excel менеджера:
   - `ДАТА: DD.MM`, 11 колонок RU/KR, цены `₩ 20 000,00`
   - № позиции из стрима или порядковый в заказе; имя `FirstName LastName`

2. **Общая функция** `buildWarehouseSheetAoa()` — для warehouse и одиночного заказа

3. **Одиночный Excel** — тот же формат, лист «Заказ»; `exportOrderExcel` async

4. **Cron** — добавлен **`warehouse_*.xlsx`** в `excel.server.ts`

5. **Админка → Excel** — warehouse первая кнопка

6. **Stream positions** — `buildStreamPositionMap`, position в API `streams/[id]`

---

## 11-nonies. Девятая сессия (19 июня 2026) — полная i18n + авто-перевод

**Коммит:** `50622f7` → push на Vercel

1. **Полная локализация UI (RU/EN/KO)**
   - `lib/i18n/messages.ts` (~130 ключей), все клиентские страницы
   - `getStatusLabel()`, `deliveryMethodLabel()`, `useSiteText()`
   - Админка на русском (→ переведена в сессии 10, см. **11-decies**)

2. **Категории каталога**
   - `categoryLocales.json` (145 EN/KO ключей), `catalogI18n.ts`
   - `scripts/generate-category-i18n.ts`

3. **Авто-перевод товаров**
   - Миграция `20260620_product_i18n.sql` — `products.i18n jsonb`
   - `translate.server.ts` (MyMemory; опц. `TRANSLATE_API_EMAIL`)
   - `POST /api/admin/products` → EN/KO при сохранении
   - `useLocalizedProduct()` на витрине

4. **LocaleSync** — cookie `locale` + `html lang`

**Сборка:** `npm run build` — OK.

---

## 11-decies. Десятая сессия (19–20 июня 2026) — шапка, i18n админки, единый вход

**Коммиты:** `af56f44` → `af253a3` → push на Vercel

### 1. Фиксы шапки (`Header.tsx`)

**Проблема:** название **SonyShopKorea** обрезалось до «Son…»; вкладка **«Косметика»** не помещалась.

**Решение:**
- Логотип + название: `shrink-0`, `whitespace-nowrap`, без `truncate`
- Навигация: `justify-start` (не `justify-center` — иначе обрезается слева)
- На `lg`–`xl` (1024–1280px) скрыты второстепенные разделы: **home, clothes, shoes** + **Контакты** в top-bar (WhatsApp/Telegram до `xl`)
- Компактнее pill-меню на `lg`: `text-xs`, меньше padding
- Top-bar: tagline `whitespace-nowrap`

### 2. Перевод адреса склада (`51ae407`)

- Ключ `contacts.address` в `messages.ts` (RU/EN/KO)
- `Footer.tsx`, `ContactsPageClient.tsx` — вместо `site.contacts.address`

### 3. Полный i18n админки + checkout (`24abfa3`, `580c6bc`)

**Новые файлы:**
- `src/lib/i18n/adminMessages.ts` — ~150 ключей `admin.*` RU/EN/KO
- `src/lib/i18n/countryMessages.ts` — `country.*` (35 стран)
- `src/hooks/useAdminSession.ts` — проверка сессии без race

**Обновлено:**
- `admin/page.tsx` — все вкладки и подкомпоненты через `useT()` + `getStatusLabel(locale)`
- `ProductEditor.tsx`, `StreamEditor.tsx` — i18n
- `delivery.ts` — `getDeliveryMethods(country, locale)`, `getCountries(locale)`, `detectRegion` по всем языкам
- `checkout/page.tsx` — локализованный datalist стран и метки доставки
- `categoryLocales.json` — исправлены битые EN/KO (muzhskaya, tkanevye, interior, clothes, verh/niz…)

**Admin auth fix:**
- `adminAuth.check()` сбрасывает `ready: false` перед запросом
- `useAdminSession("requireAuth")` на `/admin` — redirect только после свежей проверки
- Header: `adminCheck()` на mount; иконка профиля → `/admin` если admin logged in
- `/login`: если admin-сессия есть → redirect `/admin`
- `AccountShell`: ссылка `account.goToAdmin` → `/admin`

### 4. Единый вход — убрана отдельная страница админа (`af253a3`)

**Проблема:** после «Выйти» из админки открывалась `/admin/login` с отдельной формой.

**Решение:**
- Выход из админки → **`/login`**
- `/admin` без сессии → **`/login?next=/admin`**
- `/admin/login` → **redirect** на `/login?next=/admin`
- Вход admin/client только через обычную страницу `/login` (admin credentials пробуются первыми)

**Сборка:** `npm run build` — OK (34 routes).

---

## 12. Статус ТЗ и что осталось

### Готовность по ТЗ (~96–98%)

| Раздел ТЗ | Статус |
|-----------|--------|
| Excel 3 типа + cron + warehouse | ✅ на prod |
| Excel одиночный = формат склада | ✅ |
| Excel по стриму | ✅ |
| Главная / корзина / checkout | ✅ + i18n (страны/доставка) |
| Доставка / стримы / валюта | ✅ + i18n |
| **Язык RU/EN/KO** | ✅ клиент + **админка** |
| **Авто-перевод товаров** | ✅ при сохранении в админке |
| Админка + клиентская база | ✅ + i18n |
| SKU / active | ✅ |
| Дизайн Cold Luxury | ✅ |
| Единый вход / admin UX | ✅ `/login` |
| Шапка (название + навигация) | ✅ фикс lg–xl |

### ⚠️ Проверить на production

1. **Supabase:** миграции `daily_exports_bucket` + **`20260620_product_i18n`**
2. **Vercel:** `CRON_SECRET`, опц. `TRANSLATE_API_EMAIL`
3. **Старые товары:** пересохранить в админке для EN/KO
4. **MyMemory:** качество переводов местами неточное

### Git / деплой

| Коммит | Содержание |
|--------|------------|
| `9233679` | Cold Luxury + базовое ТЗ |
| `ba18dec` | Excel формат склада, cron warehouse |
| `50622f7` | i18n клиент + авто-перевод товаров |
| `af56f44` | полное название бренда в шапке |
| `68a91cc` | вкладка «Косметика», nav на lg–xl |
| `51ae407` | перевод адреса склада |
| `24abfa3` | i18n админки, checkout стран/доставки, admin session fix |
| `580c6bc` | fix EN перевод «Интерьер» |
| **`af253a3`** | **текущий production** — единый `/login`, выход в обычный вход |

### Что можно доделать дальше

1. Batch-перевод всех товаров в БД (скрипт)
2. Лучший API перевода (DeepL/Google)
3. SEO metadata по locale
4. Свой домен + реальные контакты
5. Telegram-уведомления
6. **Товары в home/clothes/shoes** (разделы есть, каталог пуст — «Скоро здесь появятся товары»)
7. Next.js upgrade
8. Показывать home/clothes/shoes в шапке на lg без скрытия (если нужно на 1024px)
9. README.md — обновить строку про `/admin/login`

---

## 13. Важные технические детали

- **Корзина:** `sonyshopkorea-cart` + optional `streamContext`
- **Заказ:** см. `types.ts` — все поля валюты и stream
- **Стрим открыт:** `isStreamOpen(ended_at)` — +24ч
- **Каталог админ vs витрина:** `useCatalog().products` vs `useCatalogProducts()`
- **Excel server/client:** не дублировать — править `excelCore.ts` (`buildWarehouseSheetAoa`)
- **Excel одиночный:** `exportOrderExcel(order)` — **async** (ждёт перевод позиций стрима)
- **i18n UI:** ключи в `lib/i18n/messages.ts`; категории — `categoryLocales.json`
- **i18n товаров:** `product.i18n` в БД; админ пишет RU → сервер переводит EN/KO
- **Locale:** `preferences.setLocale` → cookie + `LocaleSync`; SEO metadata пока RU
- **Checkout страны:** `getCountries(locale)` — datalist локализован; `detectRegion` сверяет RU/EN/KO
- **Доставка в заказе:** `method` сохраняется через `deliveryMethodLabel(methodId, locale)` при checkout
- **Админ-сессия:** `useAdminSession` — не redirect по stale `ready:true, loggedIn:false`
- **Вход админа:** только `/login`; `/admin/login` = redirect; logout → `/login`
- **Шапка (lg–xl):** разделы `home|clothes|shoes` скрыты до `xl`; `secondarySectionSlugs` в `Header.tsx`
- **Шапка:** мега-меню вне `<header>`; logo `shrink-0`; nav `justify-start`
- **pgcrypto:** `search_path = public, extensions`
- **LocaleCurrencyBar:** `light` + `scheme-light` для select на Windows
- **Build на Windows в Cursor:** нужны полные права (`all`)
- **`.agents/skills/`** — локально, не в git

---

## 14. Подсказка для нового чата

```
Проект SonyShopKorea — Next.js 14 + Supabase + Vercel.
Production: https://sonyshopkorea.vercel.app (коммит af253a3).
Handoff: project-summary.md — разделы 11-decies, 12, 13.
ТЗ: c:\Users\nurzh\Downloads\Техническое задание по доработке сайта SonyShopKorea.pdf

Сделано в сессии 10 (19–20 июня 2026):
- Фикс шапки: полное название SonyShopKorea, вкладка «Косметика», nav на lg–xl
- i18n админки (RU/EN/KO) — adminMessages.ts, ProductEditor, StreamEditor
- i18n checkout: страны и доставка (countryMessages.ts, delivery.ts)
- Перевод адреса склада (contacts.address)
- Admin session fix (useAdminSession) — не кидает на login при активной cookie
- Единый вход: /login для всех; /admin/login → redirect; logout → /login
- Исправлены битые переводы categoryLocales.json (EN/KO)

Проверить: миграция 20260620_product_i18n.sql; пересохранить старые товары для EN/KO.
Разделы home/clothes/shoes — страницы работают, товаров пока нет.
```

### Быстрые команды

```powershell
cd "c:\Users\nurzh\Projects\каталог корейской косметики"
npm run dev
Remove-Item -Recurse -Force .next; npm run dev
npm run build
git status
git add -A; git commit -m "..."; git push
```

### Типичные задачи

- «Добавить товары в разделы home/clothes/shoes»
- «Показать все 5 разделов в шапке на 1024px без скрытия»
- «Batch-перевод всех товаров в БД»
- «Улучшить переводы / сменить API перевода»
- «SEO metadata по языку»
- «Telegram-уведомления о заказах»
- «Применить миграцию product i18n в Supabase»

### Skills и MCP

- Supabase MCP — миграции, SQL
- Higgsfield MCP — hero/фоны
- `.agents/skills/design-taste-frontend/SKILL.md`
