# SonyShopKorea — сводка проекта (handoff)

> Этот файл — краткое и полное описание проекта для продолжения работы в новом чате.
> Вставьте его содержимое в начало нового диалога, чтобы ассистент сразу понял контекст.
> **Последнее обновление:** 19 июня 2026 — сессии **6–7**: закрыты почти все пункты ТЗ (Excel, стримы, клиенты, i18n, курсы, cron, категории, SKU). **Локально не запушено** — см. раздел **12**.

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
| Каталог товаров | `products` (+ `sku`, `active`) |
| Клиенты | `customers` (+ `admin_comment`, `zip`, `address`) |
| Заказы | `orders`, `order_items` (+ source, stream, валюта, fee) |
| Фото товаров | Storage `product-images` |
| Скриншоты оплаты | Storage `payment-screenshots` |
| **Авто-Excel за день** | Storage `daily-exports` (приватный) |
| Корзина | `localStorage` `sonyshopkorea-cart` (+ **streamContext**) |
| Язык/валюта | `localStorage` `sonyshopkorea-prefs` |
| Курсы (кэш UI) | `store/exchangeRates.ts` (загрузка с API) |
| Стримы | `streams`, `stream_products` |
| Сессия админа | cookie `sonyshopkorea_admin` |

---

## 3. Продакшен: ссылки и аккаунты

### Сайт (Vercel)

- **Production:** https://sonyshopkorea.vercel.app
- Панель: https://vercel.com/nurzhan1/sonyshopkorea
- **Последний запушенный коммит:** `9233679` — редизайн Cold Luxury + базовая доработка ТЗ
- **⚠️ Все правки сессий 6–7 локально, не на production** (см. git status)

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
```

**На Vercel добавить:** `CRON_SECRET` (случайная строка) для работы cron.

**Supabase:** применить миграцию `supabase/migrations/20260619_daily_exports_bucket.sql` (bucket `daily-exports`).

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
| `20260619_daily_exports_bucket.sql` | **нужно применить** (bucket auto-Excel) |

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
15:00 UTC ≈ полночь KST. Генерирует `orders_YYYY_MM_DD.xlsx` и `items_total_*.xlsx` → Storage.

---

## 6. Структура проекта (актуальная)

```
src/
  app/
    api/admin/customers/ … exports/ … cron/daily-excel/ … currency/rates/
    admin/page.tsx              вкладки: Заказы | Excel | Товары | Стримы | Клиенты
    checkout/page.tsx           source stream + живые курсы
    delivery/page.tsx           → DeliveryPageClient
    streams/[id]/page.tsx
    page.tsx                    HomeHero + HomeSectionHeading (i18n)
  components/
    admin/StreamEditor.tsx      редактирование стрима (цена/остаток)
    admin/ProductEditor.tsx     SKU, active, все sectionSlug
    home/HomeHero.tsx, HomeSectionHeading.tsx
    DeliveryPageClient.tsx
    ExchangeRatesLoader.tsx
    Header.tsx, Footer.tsx, ProductCard.tsx, LocaleCurrencyBar.tsx, …
  hooks/useTranslation.ts       useT(), useLocale()
  lib/
    excelCore.ts                общая логика workbook (сервер + клиент)
    excel.ts                    клиент: writeFile
    excel.server.ts             generateAndUploadDailyExcel()
    exchangeRates.server.ts     fetch open.er-api.com
    currency.ts                 convertFromKrw(rates?) + 3%
    i18n.ts                     ~80 ключей RU/EN/KO
    delivery.ts, types.ts, supabase/…
  store/
    cart.ts                     + streamContext { streamId, streamName }
    catalog.ts                  useCatalogProducts() фильтрует active !== false
    exchangeRates.ts            кэш курсов с API
    preferences.ts, orders.ts, auth.ts, …
  data/
    categories.ts               5 разделов: cosmetics, health, home, clothes, shoes
    products.ts                 sectionSlug расширен, sku?, active?
vercel.json
supabase/migrations/
  20260619_streams_and_orders.sql
  20260619_daily_exports_bucket.sql
```

---

## 7. Авторизация

Без изменений: клиенты через RPC + bcrypt; админ через cookie `sonyshopkorea_admin`. Единый `/login`.

---

## 8. Каталог и админка товаров

- **Витрина:** `useCatalogProducts()` — только `active !== false`
- **Админка:** `useCatalog((s) => s.products)` — все товары
- **ProductEditor:** поля **SKU**, **active** (чекбокс), цена в KRW, остаток (0 = «закончился»)
- **Разделы:** cosmetics | health | home | clothes | shoes
- Seed: `npx tsx scripts/seed.ts` или `POST /api/seed`

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
| Ядро | `excelCore.ts` — `buildDailyOrdersWorkbook`, `buildItemsTotalWorkbook`, … |
| Клиент | `excel.ts` — скачивание в браузере |
| Сервер | `excel.server.ts` — upload в `daily-exports` |

| Экспорт | Файл | Примечание |
|---------|------|------------|
| Общий за день | `orders_2026_06_19.xlsx` | 31 колонка; **Сумма до комиссии / Комиссия 3% / Итого** |
| Кол-во товаров | `items_total_*.xlsx` | **Остаток на складе** из каталога |
| Формат склада | `warehouse_*.xlsx` | RU/KR заголовки |
| Заказ клиента | `order_{номер}_{имя}.xlsx` | |

**Админка → Excel:**
- Фильтр по дате, стриму, «только оплаченные»
- Суффикс в имени файла при фильтре по стриму
- Блок **«Авто-Excel»** — ручной запуск + список файлов из Storage

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

### i18n

- `src/lib/i18n.ts` — ~80 ключей
- `hooks/useTranslation.ts` — `useT()`
- Переведено: Header, Footer (client), Cart, Checkout (заголовки), ProductCard, Streams, Delivery, Hero + заголовки главной
- **Не переведено полностью:** ЛК, админка, checkout-форма, about/contacts, часть главной (WhyUs, HowTo)

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

После push: задать `CRON_SECRET` на Vercel; применить миграцию bucket в Supabase.

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

## 12. Статус ТЗ и что осталось

### Готовность по ТЗ (~90–95%)

| Раздел ТЗ | Статус |
|-----------|--------|
| Excel 3 типа + auto cron | ✅ (нужен CRON_SECRET + bucket на prod) |
| Excel по стриму | ✅ фильтр в админке |
| Главная | ✅; категории ведут в реальные разделы |
| Корзина | ✅ |
| Доставка | ✅ + i18n |
| Стримы + 24ч + source=stream | ✅ + StreamEditor |
| Валюта KRW + 3% + живые курсы | ✅ |
| Язык RU/EN/KO | ⚠️ основные страницы; ЛК/админка/checkout-форма — частично |
| Админка + клиентская база | ✅ |
| SKU / active | ✅ |
| Дизайн | ✅ Cold Luxury; админка обновлена |

### ⚠️ Не запушено на GitHub/Vercel

Все изменения сессий 6–7 **только локально**. Production всё ещё на коммите `9233679`.

**Перед production:**
1. `git push`
2. Vercel: `CRON_SECRET`
3. Supabase: миграция `20260619_daily_exports_bucket.sql`

### Что можно доделать дальше

1. Полный i18n: ЛК, checkout-форма, админка, about/contacts
2. Свой домен + реальные контакты в `site.ts`
3. Telegram-уведомления о заказах
4. `next-intl` вместо самописного `i18n.ts` (опционально)
5. Товары в разделах home/clothes/shoes (сейчас пустые каталоги — нужно добавить через админку)
6. Next.js upgrade (security advisory 14.2.5)

---

## 13. Важные технические детали

- **Корзина:** `sonyshopkorea-cart` + optional `streamContext`
- **Заказ:** см. `types.ts` — все поля валюты и stream
- **Стрим открыт:** `isStreamOpen(ended_at)` — +24ч
- **Каталог админ vs витрина:** `useCatalog().products` vs `useCatalogProducts()`
- **Excel server/client:** не дублировать логику — править `excelCore.ts`
- **pgcrypto:** `search_path = public, extensions`
- **Шапка:** мега-меню вне `<header>`; `scrollbar-gutter: stable`; не `overflow-x-hidden` на header
- **LocaleCurrencyBar:** `light` + `scheme-light` для select на Windows
- **Build на Windows в Cursor:** нужны полные права (`all`)
- **`.agents/skills/`** — локально, не в git

---

## 14. Подсказка для нового чата

```
Проект SonyShopKorea — Next.js + Supabase + Vercel.
Production: https://sonyshopkorea.vercel.app (старый деплой 9233679).
Локально сделаны сессии 6–7 — см. project-summary.md разделы 11-sexies, 11-septies, 12.
ТЗ: c:\Users\nurzh\Downloads\Техническое задание по доработке сайта SonyShopKorea.pdf
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

- «Запушить все локальные правки на Vercel»
- «Применить миграцию daily-exports в Supabase»
- «Доделать i18n для ЛК и checkout»
- «Добавить товары в разделы home/clothes/shoes»

### Skills и MCP

- Supabase MCP — миграции, SQL
- Higgsfield MCP — hero/фоны
- `.agents/skills/design-taste-frontend/SKILL.md`
