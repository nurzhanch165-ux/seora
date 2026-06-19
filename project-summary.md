# SonyShopKorea — сводка проекта (handoff)

> Этот файл — краткое и полное описание проекта для продолжения работы в новом чате.
> Вставьте его содержимое в начало нового диалога, чтобы ассистент сразу понял контекст.
> **Последнее обновление:** июнь 2026 — доработка по **ТЗ заказчика** (Excel, стримы, валюта, доставка, редизайн), миграция Supabase `streams`, скиллы **taste-skill**. **Все правки пока локально — не запушены на Vercel.**

---

## 1. Задача проекта

Интернет-магазин товаров из Южной Кореи для клиентов из разных стран. На первом этапе два раздела: **«Косметика»** и **«Всё для здоровья»**, с возможностью в будущем добавлять новые (одежда, обувь, техника и т.д.).

Ключевой сценарий: клиент регистрируется → выбирает товары → корзина → нажимает «Сформировать заказ» → получает **Excel-файл заказа** → оплачивает по реквизитам → загружает скриншот оплаты → администратор подтверждает оплату → оплаченные заказы объединяются в **общий Excel для склада** → отгрузка.

Особенности из ТЗ:
- Регистрация **по логину и паролю** (логин придумывает сам клиент), email необязателен (ключевые контакты — телефон, WhatsApp, Telegram).
- 11 статусов заказа.
- Карточка товара со множеством полей (применение, результат, способ, граммовка, срок годности, сертификаты и т.д.).
- Ручная оплата на первом этапе (онлайн-оплата — в планах).
- Мультиязычность, оптовые клиенты, уведомления — в планах (этап 2).

Требования по дизайну от заказчика: премиальный, не «колхозный» вид, без эмодзи, иконки нарисованы вручную (SVG).

---

## 2. Технологический стек

- **Next.js 14.2.5** (App Router) + **React 18.3** + **TypeScript 5.5**
- **Tailwind CSS 3.4** — стилизация, собственная дизайн-система
- **Zustand 4.5** — клиентское состояние (корзина, избранное, сессия ЛК, кэш каталога/заказов)
- **Supabase** (PostgreSQL + Storage) — общая БД: каталог, клиенты, заказы
- **@supabase/supabase-js 2.45** — клиент Supabase (браузер + сервер)
- **xlsx (SheetJS) 0.18.5** — генерация Excel-файлов в браузере
- **server-only** — маркер серверных модулей
- Шрифты: **Lora** + **Inter** (через `next/font/google`)

### Что где хранится (после миграции на Supabase)

| Данные | Где |
|--------|-----|
| Каталог товаров | Таблица `products` в Supabase |
| Клиенты (логин, профиль, bcrypt-пароль) | Таблица `customers` + RPC-функции |
| Заказы и позиции | Таблицы `orders`, `order_items` |
| Фото товаров | Supabase Storage `product-images` (публичный) |
| Скриншоты оплаты | Supabase Storage `payment-screenshots` (приватный, signed URL) |
| Корзина, избранное | `localStorage` (`sonyshopkorea-cart`, `sonyshopkorea-wishlist`) |
| Язык и валюта (UI) | `localStorage` (`sonyshopkorea-prefs`) |
| Стримы и товары стримов | Таблицы `streams`, `stream_products` в Supabase |
| Текущий клиент в ЛК | `localStorage` (`sonyshopkorea-auth`, без пароля) |
| Сессия админа | httpOnly-cookie `sonyshopkorea_admin` (сервер) |

> **ВАЖНО:** каталог, клиенты и заказы теперь **общие для всех устройств** через Supabase. Админ видит заказы всех клиентов; правки каталога в админке видны всем.

---

## 3. Продакшен: ссылки и аккаунты

### Сайт (Vercel)

- **Основная ссылка:** https://sonyshopkorea.vercel.app
- Панель: https://vercel.com/nurzhan1/sonyshopkorea
- Проект Vercel: `nurzhan1/sonyshopkorea`
- Старые alias (`seora-shop.vercel.app` и др.) могут ещё работать, пока не удалены в Domains

### GitHub

- **Репозиторий:** https://github.com/nurzhanch165-ux/seora (имя папки на диске может остаться «каталог корейской косметики»; переименование репозитория в `sonyshopkorea` — опционально)
- Ветка: `main`
- Git подключён к Vercel → **авто-деплой при `git push`**
- Последний **запушенный** коммит: `383fcd0` — `rebrand: SEORA -> SonyShopKorea`
- **НЕ запушено (локально, июнь 2026):** мобильная вёрстка (сессия 3) + вся доработка по ТЗ и редизайн (сессия 4) — см. разделы 11-ter, 11-quater

### Supabase

- **Организация:** `seora` (метка организации; на сайт не влияет, можно переименовать в Dashboard по желанию)
- **Проект:** `nurzhanch165-ux's Project`
- **Project ref / id:** `tmdakiocltbfjawkdwdw`
- **Регион:** `ap-northeast-2` (Сеул)
- **URL:** `https://tmdakiocltbfjawkdwdw.supabase.co`
- **Панель:** https://supabase.com/dashboard/project/tmdakiocltbfjawkdwdw
- В проекте доступен **Supabase MCP** (Cursor plugin)

### Учётные данные

- **Администратор сайта:** логин `admin`, пароль `admin123` (env: `ADMIN_LOGIN`, `ADMIN_PASSWORD`)
- **Клиент:** регистрация на `/register`, вход на `/login` по придуманному логину

### Переменные окружения

Файл-образец: `.env.example`. Локально: `.env.local` (в git не попадает).

```
NEXT_PUBLIC_SUPABASE_URL=https://tmdakiocltbfjawkdwdw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable/anon key из Supabase Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<secret key — ТОЛЬКО сервер, никогда в браузер>
ADMIN_LOGIN=admin
ADMIN_PASSWORD=admin123
```

На Vercel те же переменные заданы в **Project → Settings → Environment Variables** (Production).

> **Безопасность:** `SUPABASE_SERVICE_ROLE_KEY` обходит RLS — хранить только на сервере. Если ключ утёк в чат — **ротировать** в Supabase Dashboard → Settings → API.

---

## 4. Дизайн-система (актуальная после сессии 4)

### Палитра (`tailwind.config.ts`)

| Токен | Цвет | Назначение |
|-------|------|------------|
| `paper` | `#F7F4EF` | Фон страницы |
| `surface` | `#FDFCFA` | Карточки |
| `ink` / `navy` | `#0C1427` | Текст, тёмные секции |
| `accent` | `#C7303E` | Кнопки, акцент (корейский красный) |
| `gold` | `#C9A962` | Подзаголовки на тёмном фоне |
| `success` | `#2D6A4F` | Статусы |

**Было (сессии 1–3):** терракота `#9B5B3F`, бумага `#F4F1EA`.

### Визуал

- Hero и стримы: AI-изображения через **Higgsfield** → `public/images/hero-korea.png`, `public/images/streams-bg.png`
- Шрифты: **Lora** (заголовки) + **Inter** (UI)
- Иконки — ручные SVG в `src/components/icons.tsx` (без эмодзи)
- Классы: `.btn-primary` (navy→accent), `.icon-btn`, `.card`, `.section-dark`, `.gradient-text`, `.card-glass`

### Cursor skills (design)

Установлен пакет **Leonxlnx/taste-skill** (`npx skills add Leonxlnx/taste-skill`):

```
.agents/skills/
  design-taste-frontend      — anti-slop UI, редизайн
  redesign-existing-projects
  high-end-visual-design
  imagegen-frontend-web/mobile
  … (всего 13 скиллов)
```

При доработке дизайна — читать `.agents/skills/design-taste-frontend/SKILL.md`.

---

## 5. Архитектура бэкенда (Supabase + серверные роуты)

### Схема БД

Полный SQL: `supabase/schema.sql` (применён к проекту через Supabase MCP).

**Таблицы:**
- `customers` — клиенты (+ поля `admin_comment`, `zip`, `address` после миграции 2026-06)
- `products` — каталог (+ `sku`, `active` после миграции)
- `orders` — заказы (+ `source`, `stream_id`, `stream_name`, `currency_code`, `exchange_rate`, `total_krw`, `total_converted`, `fee_amount`, `admin_comment`)
- `order_items` — позиции (+ `sku`, `price_krw`, `price_converted`)
- `streams` — стримы (`title`, `stream_date`, `ended_at`)
- `stream_products` — товары в стриме (`product_id`, `price_override`, `stock`, `position`)

**Миграция:** `supabase/migrations/20260619_streams_and_orders.sql` — **применена** к Supabase через MCP (`apply_migration`, project `tmdakiocltbfjawkdwdw`).

**RLS:**
- `products`, `streams`, `stream_products` — публичное чтение (anon)
- `customers`, `orders`, `order_items` — **без политик для anon**; доступ только через RPC и серверные роуты с `service_role`

**RPC-функции (security definer):**
- `register_customer` — регистрация
- `authenticate_customer` — вход по логину или телефону + пароль
- `change_password` — смена пароля (нужен текущий)
- `reset_password` — сброс по логину + телефону
- `update_customer_profile` — обновление профиля и логина

**Storage buckets:**
- `product-images` — публичный (фото товаров)
- `payment-screenshots` — приватный (скриншоты оплаты, отдаются через signed URL)

### Серверные API-роуты (`src/app/api/`)

| Роут | Назначение |
|------|------------|
| `POST /api/admin/login` | Вход админа → httpOnly-cookie |
| `POST /api/admin/logout` | Выход админа |
| `GET /api/admin/me` | Проверка сессии админа |
| `POST /api/admin/products` | Создание/обновление товара (upsert) |
| `DELETE /api/admin/products?id=` | Удаление товара |
| `POST /api/admin/upload` | Загрузка фото в Storage → URL |
| `GET /api/orders?customerId=` | Заказы клиента |
| `GET /api/orders` | Все заказы (только админ) |
| `POST /api/orders` | Создание заказа (с полями валюты, source, stream) |
| `PATCH /api/orders/[id]` | Смена статуса / подтверждение оплаты (админ) |
| `POST /api/orders/[id]/screenshot` | Загрузка скриншота оплаты |
| `GET /api/streams` | Список стримов |
| `POST /api/streams` | Создание стрима (админ) |
| `GET/PATCH/DELETE /api/streams/[id]` | Стрим + товары |
| `POST /api/seed` | Заливка seed-каталога (только админ) |

### Клиенты Supabase

- `src/lib/supabase/client.ts` — `getSupabase()` для браузера (anon key, ленивая инициализация)
- `src/lib/supabase/admin.ts` — `createAdminClient()` с `service_role` (**только сервер**)
- `src/lib/supabase/products.ts` — маппинг `Product` ↔ snake_case строки БД
- `src/lib/supabase/orders.ts` — маппинг заказов + signed URL для скриншотов
- `src/lib/adminAuth.server.ts` — проверка админа по cookie

---

## 6. Структура проекта (актуальная)

```
src/
  app/
    api/
      admin/ … orders/ … streams/ … seed/
    streams/                    список и /streams/[id]
    page.tsx                    главная (блоки по ТЗ)
    delivery/page.tsx           доставка KZ/EU/KR
    checkout/page.tsx           валюта + доставка по стране
    admin/page.tsx              вкладки: Заказы, Excel, Товары, Стримы
  components/
    CartToast.tsx               «Товар добавлен в корзину»
    LocaleCurrencyBar.tsx       RU/EN/KO + KRW/KZT/USD/EUR
    Header.tsx, ProductCard.tsx, …
  lib/
    currency.ts                 KRW база, +3% комиссия, курсы (захардкожены)
    delivery.ts                 KZ авиа/карго, EU EMS, KR внутри страны
    i18n.ts                     базовые переводы (~20 ключей)
    excel.ts                    3 типа Excel + формат склада
    types.ts                    Order + Stream, isStreamOpen(), таймер 24ч
    supabase/ …
  store/
    preferences.ts              locale + currency (sonyshopkorea-prefs)
    cartToast.ts
    catalog.ts, auth.ts, orders.ts, cart.ts, wishlist.ts, adminAuth.ts
  data/
    site.ts                     currencyCode: KRW, currency: ₩
public/
  images/
    hero-korea.png              Higgsfield hero
    streams-bg.png              Higgsfield фон стримов
supabase/
  schema.sql                    базовая схема
  migrations/
    20260619_streams_and_orders.sql
.agents/skills/                 taste-skill (13 скиллов дизайна)
scripts/seed.ts
```

**ТЗ заказчика (PDF):** `c:\Users\nurzh\Downloads\Техническое задание по доработке сайта SonyShopKorea.pdf`

---

## 7. Авторизация

### Клиенты

- Вход по **логину** (или телефону для старых аккаунтов) + пароль.
- Пароли хранятся как **bcrypt-хеш** в `customers.password_hash`.
- Браузер вызывает RPC через `getSupabase().rpc(...)` — хеш никогда не уходит на клиент.
- После входа в `store/auth.ts` хранится `current: Account` (без поля password) в localStorage (`sonyshopkorea-auth`).
- Регистрация, профиль, смена/сброс пароля — всё через RPC (см. `supabase/schema.sql`).

### Администратор

- Логин/пароль проверяются **на сервере** (`src/lib/adminAuth.server.ts`).
- Успешный вход → httpOnly-cookie `sonyshopkorea_admin` (sha256 от `ADMIN_LOGIN:ADMIN_PASSWORD`).
- `store/adminAuth.ts` — `check()` / `login()` / `logout()` через `/api/admin/*`.
- Все роуты админки и API защищены `isAdminRequest()`.

### Единый вход `/login`

Сначала проверяется админ (cookie API), затем клиент (RPC Supabase).

---

## 8. Каталог и админка товаров

- **Витрина:** `useCatalogProducts()` → `supabase.from('products').select('*')`. До загрузки показывает seed из `data/products.ts`.
- **Админка → Товары:** создание/редактирование/удаление через `/api/admin/products`.
- **Фото:** загрузка через `/api/admin/upload` → Supabase Storage `product-images` → публичный URL в `products.images[]`.
- **Seed:** 25 товаров залиты в БД. Повторная заливка: `npx tsx scripts/seed.ts` или `POST /api/seed` (под админом).
- Soft-delete (`removed`/`overrides` в localStorage) **убран** — удаление теперь реальное (DELETE в БД).

---

## 9. Заказы, Excel, валюта

### Заказы

- Создание: `POST /api/orders` при оформлении (`checkout/page.tsx`). Номер: **`SSK-YYMMDD-XXX`**
- В заказ сохраняются: `source` (`catalog` | `stream`), `currencyCode`, `exchangeRate`, `totalKrw`, `totalConverted`, `feeAmount`, `streamId`, `streamName`
- ⚠️ Заказы **со страницы стрима** пока всё ещё уходят как `source: catalog` — нужно доделать
- Скриншот оплаты → Storage `payment-screenshots`; подтверждение → `PATCH /api/orders/[id]`

### Excel (`src/lib/excel.ts`) — приоритет ТЗ

| Функция | Файл | Назначение |
|---------|------|------------|
| `exportDailyOrdersExcel` | `orders_2026_06_19.xlsx` | Полный формат ТЗ (28 колонок), одна строка = один товар |
| `exportItemsTotalExcel` | `items_total_*.xlsx` | Агрегация кол-ва по товарам за дату |
| `exportWarehouseExcel` | `warehouse_*.xlsx` | **Формат склада заказчика** (RU/KR заголовки, ₩, карго/авиа/EMS) |
| `exportOrderExcel` | `order_{номер}_{имя}.xlsx` | Файл для клиента |

Скачивание: админка → вкладка **Excel** (выбор даты, фильтр «только оплаченные»).

### Валюта (`src/lib/currency.ts`)

- Базовая цена товара в БД — **KRW (₩)**
- Отображение: KRW / KZT / USD / EUR (переключатель в шапке)
- Конвертация: курс × **+3% комиссия** (`CONVERSION_FEE = 0.03`)
- Курсы **захардкожены** в `EXCHANGE_RATES` — нужны живые API для продакшена

### Доставка (`src/lib/delivery.ts`)

| Регион | Способы |
|--------|---------|
| Казахстан | Авиа (K) 9$/кг, Карго (CK) 4$/кг |
| Европа | Только EMS |
| Южная Корея | Внутри страны |
| Остальные | EMS |

Checkout подставляет методы по стране клиента/доставки.

### Стримы

- `/streams` — список; `/streams/[id]` — товары + **таймер 24ч** после `ended_at`
- После 24ч: товары видны, кнопка «В корзину» недоступна
- Админка → **Стримы**: создать стрим, выбрать товары из базы, задать дату окончания
- Соцссылки TikTok/Telegram на странице стримов

---

## 10. Запуск и деплой

### Локально

```bash
npm install
cp .env.example .env.local   # заполнить ключи Supabase
npm run dev                    # http://localhost:3000
npm run build                  # production-сборка
```

Заливка каталога в Supabase:
```bash
npx tsx scripts/seed.ts
```

### Деплой на Vercel

**Автоматически** при `git push` в `main` (GitHub подключён к Vercel).

**Вручную** (если нужно):
```powershell
Set-Location "c:\Users\nurzh\Projects\каталог корейской косметики"
npx vercel --prod --yes
```

### Git

```powershell
git add .
git commit -m "описание изменений"
git push
```

Репозиторий: https://github.com/nurzhanch165-ux/seora

> На Windows после установки Git может понадобиться **перезапуск Cursor**, чтобы `git` был в PATH. Или использовать полный путь: `C:\Program Files\Git\cmd\git.exe`.

---

## 11. Что было сделано в чате (июнь 2026)

1. **Supabase:** создан проект, применена схема (`supabase/schema.sql`), RPC-авторизация, Storage buckets, RLS.
2. **Миграция кода:** `store/catalog`, `store/auth`, `store/orders`, `store/adminAuth` переведены с localStorage на Supabase + серверные API.
3. **Фото и скриншоты:** загрузка в Supabase Storage (вместо data URL в localStorage).
4. **Seed:** 25 товаров залиты в `products`.
5. **Vercel:** production-деплой, env-переменные, основной домен `seora-shop.vercel.app`.
6. **GitHub:** репозиторий `nurzhanch165-ux/seora`, первый коммит, подключение к Vercel для авто-деплоя.
7. **Установлены:** Git, GitHub CLI, `@supabase/supabase-js`, `server-only`.

---

## 11-bis. Что сделано во второй сессии (июнь 2026)

Все правки задеплоены (`git push` → Vercel). Подробности по файлам:

1. **Фикс регистрации (`gen_salt does not exist`).**
   - Причина: расширение `pgcrypto` установлено в схему `extensions`, а RPC-функции имели `search_path = public` и не находили `gen_salt`/`crypt`.
   - В Supabase обновлён `search_path` всех RPC на `public, extensions`; то же зафиксировано в `supabase/schema.sql` (`create extension ... with schema extensions` + `set search_path = public, extensions`).
   - `src/store/auth.ts`: функция `rpcError` теперь разбирает `PostgrestError` (`message/details/hint`) вместо общей «Ошибка соединения».

2. **Адрес доставки в Excel (`src/lib/excel.ts`).**
   - `exportOrderExcel`: добавлен блок «ДОСТАВКА» (получатель, телефон, страна, город, адрес, индекс, способ).
   - `exportWarehouseExcel`: добавлены колонки получателя/адреса/способа доставки; правка объединения шапки; фолбэк комментария на `delivery.comment`.

3. **Устранение «постоянных вылетов» из аккаунта.**
   - Причина: страницы `/login` и `/register` показывали форму уже залогиненному пользователю (иллюзия выхода при «назад»).
   - `src/app/login/page.tsx` и `src/app/register/page.tsx`: при `hydrated && current` — `router.replace(next)` в `/account`.

4. **Доступ администратора к ЛК и оформлению заказа.**
   - Причина: `CheckoutPage` и `AccountShell` пускали только клиента (`useAuth.current`), а админ авторизован по cookie (`useAdminAuth`).
   - `src/app/checkout/page.tsx`: гейт пропускает, если `account || adminLoggedIn`; ждёт `adminReady`.
   - `src/components/AccountShell.tsx`: то же; в сайдбаре при админ-входе показывает «Администратор / Служебный вход».
   - Со страницы `/login` убрана подпись про вход администратора.

5. **Мобильная оптимизация (лаги + пустое меню «три полоски»).**
   - Причина лагов и пустого меню: `backdrop-filter` на липкой шапке создавал containing block, из-за чего `position: fixed` оверлеи (мобильное меню, поиск) схлопывались; плюс тормоза при скролле.
   - `src/components/Header.tsx`: убран `backdrop-blur-md` у шапки (`bg-paper`); оверлеи поиска и мобильное меню вынесены **из** `<header>` в фрагмент; поправлены z-index.
   - `src/components/ProductVisual.tsx`: `loading="lazy"` + `decoding="async"` на `<img>`.
   - `src/components/ProductCard.tsx`: убран `backdrop-blur` с кнопок; кнопка «Добавить в корзину» сделана только для десктопа (`lg:block`).

6. **Фикс мобильной вёрстки во вкладке «Товары» (админка) и шапки.**
   - Причина: сетка списка товаров `grid ... sm:grid-cols-2` без базового `grid-cols-1` — единственная колонка тянулась по содержимому, а `truncate` в названии раздувал карточку шире экрана (горизонтальный скролл на ≤360px).
   - `src/app/admin/page.tsx`: добавлены `grid-cols-1` и `min-w-0` карточке.
   - `src/components/Header.tsx`: на узких экранах (≤360px) правый кластер иконок вылезал — уменьшены отступы иконок (`px-2 sm:px-2.5`), гэпы и трекинг логотипа (`tracking-[0.18em] sm:tracking-[0.28em]`).

7. **Git-деплой.** Настроен `user.name/email`; на Windows песочница Cursor (`workspace_readwrite`) блокирует git/`npm run build` — выполнять с полными правами (вне песочницы).

8. **Для клиента** составлен список функций сайта по пунктам (витрина, каталог, карточка товара, корзина, оформление, ЛК, админка).

---

## 11-ter. Что сделано в третьей сессии (июнь 2026) — ребрендинг + домен + мобильная вёрстка

### A. Ребрендинг SEORA → SonyShopKorea

Полная замена бренда в коде (по запросу заказчика — «прям все Seora»).

**Отображаемое название и контакты** (`src/data/site.ts`):
- `name`: `SonyShopKorea`, `fullName`: `SonyShopKorea — корейская косметика и здоровье`
- Соцсети/email (пока заглушки, при необходимости заменить на реальные): `@sonyshopkorea`, `hello@sonyshopkorea.com`
- Получатель карты: `SONYSHOPKOREA TRADE`

**Внутренние ключи** (после смены у пользователей обнуляются корзина, избранное, сессия):
| Было | Стало |
|------|-------|
| `seora-cart` | `sonyshopkorea-cart` |
| `seora-wishlist` | `sonyshopkorea-wishlist` |
| `seora-auth` | `sonyshopkorea-auth` |
| cookie `seora_admin` | `sonyshopkorea_admin` |

**Файлы с правками:**
- `src/data/site.ts` — название, контакты, реквизиты
- `src/store/cart.ts`, `wishlist.ts`, `auth.ts` — ключи localStorage
- `src/lib/adminAuth.server.ts` — имя cookie
- `src/app/checkout/page.tsx` — префикс номера заказа `SSK-`
- `README.md`, `.env.example`, `supabase/schema.sql` — заголовки

**Деплой ребрендинга:** пользователь выполнил `git push` вручную (терминал в Cursor иногда не отвечает). Коммит на GitHub: `rebrand: SEORA -> SonyShopKorea`.

### B. Домен Vercel

- Проект Vercel переименован пользователем в **`sonyshopkorea`**
- В **Settings → Domains** добавлен домен **`sonyshopkorea.vercel.app`**
- **Основная ссылка для клиентов:** https://sonyshopkorea.vercel.app
- Старые alias (`seora-shop.vercel.app`, `shop-seora.vercel.app` и др.) могут ещё работать, пока не удалены в Domains
- Короткий `sonyshopkorea.vercel.app` изначально давал 404, пока домен не был добавлен вручную в Domains (переименование проекта ≠ автоматическая привязка домена)

### C. Мобильная вёрстка (фикс «всё плывёт» на телефоне)

**Диагностика:** на ширине 390px горизонтальный скролл ~76px. Причина — шапка: длинное «SonyShopKorea» (`text-2xl` + широкий `letter-spacing`) + 4 иконки с большим padding от `.btn-ghost`.

**Глобально:**
- `src/app/globals.css` — `overflow-x: hidden` на `html`/`body`; `.container-site`: `min-w-0`, `px-4` на мобильном; новый класс **`.icon-btn`** (компактные круглые кнопки 36–40px)
- `src/app/layout.tsx` — `export const viewport` (`device-width`, `initialScale: 1`, `viewportFit: cover`); `overflow-x-hidden` на `<body>`

**Шапка** (`src/components/Header.tsx`):
- Логотип: `text-[15px]` + узкий tracking на мобильном, `truncate`, `min-w-0`
- Иконки: `.icon-btn` вместо `.btn-ghost`
- На экранах **≤359px** скрыта иконка «Избранное» (`max-[359px]:hidden`)
- `overflow-x-hidden` на `<header>`, высота `h-14` на мобильном

**Главная** (`src/app/page.tsx`):
- Hero: меньший заголовок, меньшие отступы
- Карточки разделов: `p-5`, заголовки `text-2xl`
- Полоска категорий: **2 колонки** на мобильном (было 3), `line-clamp-2` на названиях
- Баннер акции: меньше padding; декоративный `Sparkle` скрыт на мобильном
- Секции: `mt-16 sm:mt-24`

**Остальные компоненты:**
- `src/components/Footer.tsx` — одна колонка на мобильном; email с `break-all`
- `src/components/ProductGrid.tsx` — `min-w-0`, меньшие gap на мобильном
- `src/components/ProductCard.tsx` — `min-w-0`; кнопка **«В корзину»** на мобильном (`lg:hidden`), т.к. hover-кнопка только на десктопе
- `src/components/ProductDetail.tsx` — адаптивные заголовки/цены; кнопка «Добавить» на всю ширину на мобильном
- `src/app/cart/page.tsx` — `min-w-0`, `line-clamp-2` на названиях
- `src/app/checkout/page.tsx` — `p-4` в карточках секций на мобильном
- `src/components/CatalogView.tsx` — панель сортировки/фильтров не ломает строку
- `src/components/SectionHeading.tsx` — ссылка «Смотреть все» видна и на мобильном
- `src/components/FloatingContacts.tsx` — safe-area insets, чуть меньше кнопка на мобильном

**Деплой мобильных правок:** включены в общий незапушенный diff (сессия 3 + 4).

---

## 11-quater. Четвёртая сессия (июнь 2026) — доработка по ТЗ + редизайн

Источник: PDF «Техническое задание по доработке сайта SonyShopKorea» + пример Excel склада от заказчика.

### A. Excel (главный приоритет ТЗ) — ~80% готово

- Переписан `src/lib/excel.ts`: 4 функции экспорта (см. раздел 9)
- Админка → вкладка **Excel**: выбор даты, 3 кнопки скачивания
- Фильтры заказов: страна, доставка, оплата, статус

**Не сделано по ТЗ:**
- Автоформирование Excel каждый день (cron/scheduled job)
- Отдельная выгрузка Excel **по конкретному стриму**
- Колонки «сумма до 3%» / «сумма после 3%» отдельно
- «Остаток на складе» в `items_total` (колонка пустая)

### B. Главная страница (ТЗ п.3)

- Hero с Higgsfield-фото + градиент, акцент «международная доставка»
- Блок «О компании», «Что можно купить» (6 категорий), «Почему выбирают нас» (7 пунктов), «Как сделать заказ» (8 шагов)
- ⚠️ Категории «Одежда», «Обувь», «Товары для дома» — **заглушки** (ведут в `/c/cosmetics`)

### C. Корзина (ТЗ п.4)

- `CartToast.tsx` — уведомление + «Перейти в корзину»
- Badge на иконке корзины (pulse)
- Цены в выбранной валюте на карточках (`useDisplayPrice`)

### D. Доставка (ТЗ п.5)

- `src/lib/delivery.ts` + checkout + `/delivery` переписаны под KZ/EU/KR

### E. Стримы (ТЗ п.7) — ~75% готово

- Страницы `/streams`, `/streams/[id]`
- API `GET/POST /api/streams`, `GET/PATCH/DELETE /api/streams/[id]`
- Таймер 24ч (`isStreamOpen`, `streamDeadline` в `types.ts`)
- Админка → вкладка **Стримы**
- Supabase миграция применена

**Не сделано:** заказ из стрима с `source: stream`; редактирование стрима; отдельная цена/остаток в UI админки после создания

### F. Валюта и язык (ТЗ п.8) — ~60% готово

- `store/preferences.ts`, `LocaleCurrencyBar` в шапке
- KRW база, +3% при KZT/USD/EUR
- `i18n.ts` — ~20 ключей (RU/EN/KO), **не весь сайт переведён**

### G. Админка (ТЗ п.9) — ~70% готово

- Фильтры заказов, Excel, стримы
- **Нет UI:** клиентская база, комментарий админа к заказу
- Статусы — упрощённый маппинг, не строго 8+3 из ТЗ
- Редактор товаров: нет SKU, active/out_of_stock в UI

### H. Редизайн

- Новая палитра navy + красный + золото
- Higgsfield: `public/images/hero-korea.png`, `streams-bg.png`
- Установлен **taste-skill** для следующих итераций дизайна

### I. Сборка и git

- `npm run build` — **OK** (проверено локально)
- **Все изменения не закоммичены и не на Vercel**
- Production https://sonyshopkorea.vercel.app — **старый дизайн** (до сессии 4)

**Закоммитить и задеплоить:**
```powershell
git add -A
git commit -m "feat: доработка по ТЗ — Excel, стримы, валюта, доставка, редизайн"
git push
```

---

## 12. Статус ТЗ и следующие шаги

### Готовность по ТЗ (оценка ~70–75%)

| Раздел ТЗ | Статус |
|-----------|--------|
| Excel 3 типа | ✅ структура есть; ❌ авто-ежедневный, Excel по стриму, остатки |
| Главная | ✅ блоки есть; ⚠️ часть категорий — заглушки |
| Корзина | ✅ |
| Доставка по странам | ✅ |
| Стримы + 24ч | ✅; ❌ source=stream при заказе |
| Валюта KRW + 3% | ✅; ⚠️ статические курсы |
| Язык RU/EN/KO | ⚠️ переключатель + частичные переводы |
| Админка | ⚠️ Excel/стримы/фильтры; ❌ клиентская база |
| Дизайн | ✅ редизайн; можно улучшить через taste-skill |

### Приоритеты (что делать дальше)

1. **git push** — задеплоить всё на Vercel
2. Excel: выгрузка по стриму, колонки комиссии, остатки склада
3. Заказы из стрима (`source: stream`, `streamName` в Excel)
4. Клиентская база в админке
5. Полный i18n (`next-intl` или расширить `i18n.ts`)
6. Живые курсы валют
7. Доработка дизайна через `.agents/skills/design-taste-frontend`
8. Свой домен, контакты в `site.ts`, Telegram-уведомления

### Ограничения (без изменений)

1. Авторизация клиентов — кастомная (не Supabase Auth)
2. Категории в `data/categories.ts` (не в БД)
3. Корзина/избранное — localStorage
4. Next.js 14.2.5 — security advisory
5. Контакты в `site.ts` — заглушки

---

## 13. Важные технические детали

- Товары: id `p01`, `h01`; добавленные админом — `ap...`. Витрина — `useCatalogProducts()` из `store/catalog.ts`.
- **localStorage ключи:** `sonyshopkorea-cart`, `sonyshopkorea-wishlist`, `sonyshopkorea-auth`, `sonyshopkorea-prefs` (locale + currency).
- **Заказ (TypeScript):** `Order` включает `source`, `streamId`, `streamName`, `currencyCode`, `exchangeRate`, `totalKrw`, `totalConverted`, `feeAmount`, `adminComment`; позиции — `sku`, `priceKrw`, `priceConverted`.
- **Стрим открыт для заказа:** `Date.now() < endedAt + 24h` — см. `isStreamOpen()` в `types.ts`.
- Страницы с `useSearchParams` обёрнуты в `<Suspense>`.
- `npm run build` на Windows в песочнице Cursor может не писать `.next` — запускать с полными правами.
- Supabase MCP: project ref `tmdakiocltbfjawkdwdw`.
- **pgcrypto / RPC:** `search_path = public, extensions` обязателен для `gen_salt`/`crypt`.
- **Адаптив:** `grid-cols-1` при `truncate`; `ProductGrid` на `grid-cols-2`; `.icon-btn` в шапке; оверлеи вне `<header>`.
- **Higgsfield MCP** — для генерации hero/фонов; файлы сохранять в `public/images/`.
- **taste-skill** — `.agents/skills/design-taste-frontend/SKILL.md` при редизайне.
- Старые ключи `seora-*` больше не используются.
- **`backdrop-filter` на шапке** — не использовать (ломает fixed-оверлеи); оверлеи вне `<header>`.
- **`scripts/`** исключён из `tsconfig.json`.

---

## 14. Подсказка для нового чата

Проект **SonyShopKorea** на Next.js + Supabase + Vercel + GitHub.

- **Production (старый UI):** https://sonyshopkorea.vercel.app
- **Локально (новый UI + ТЗ):** `npm run dev` → http://localhost:3000
- **Handoff:** вставьте этот файл целиком или разделы **1–3, 9, 11-quater, 12, 13**

### Быстрые команды

```powershell
cd "c:\Users\nurzh\Projects\каталог корейской косметики"
npm run dev          # локальный просмотр
npm run build        # проверка сборки (нужны полные права на Windows)
git add -A && git commit -m "..." && git push   # деплой на Vercel
```

### Хорошие следующие задачи

- «Закоммитить и запушить все изменения сессии 4 на Vercel»
- «Доделать ТЗ: Excel по стриму, source=stream, клиентская база»
- «Улучшить дизайн через taste-skill (design-taste-frontend)»
- «Подключить живые курсы валют»
- «Полный перевод сайта RU/EN/KO»

### Skills и MCP

- **Supabase MCP** — миграции, SQL, логи (`supabase/SKILL.md`)
- **Higgsfield MCP** — генерация hero/фонов
- **taste-skill** — `.agents/skills/` (design-taste-frontend, redesign-existing-projects)
