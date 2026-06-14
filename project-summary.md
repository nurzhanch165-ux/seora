# SEORA — сводка проекта (handoff)

> Этот файл — краткое и полное описание проекта для продолжения работы в новом чате.
> Вставьте его содержимое в начало нового диалога, чтобы ассистент сразу понял контекст.
> **Последнее обновление:** июнь 2026 — подключён Supabase, задеплоено на Vercel, код на GitHub.

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
| Корзина, избранное | `localStorage` (как и раньше) |
| Текущий клиент в ЛК | `localStorage` (`seora-auth`, без пароля) |
| Сессия админа | httpOnly-cookie `seora_admin` (сервер) |

> **ВАЖНО:** каталог, клиенты и заказы теперь **общие для всех устройств** через Supabase. Админ видит заказы всех клиентов; правки каталога в админке видны всем.

---

## 3. Продакшен: ссылки и аккаунты

### Сайт (Vercel)

- **Основная ссылка:** https://seora-shop.vercel.app
- Также работает: https://seora-nine.vercel.app (старый alias Vercel)
- `seora.vercel.app` — **занят** другим проектом на Vercel, использовать нельзя
- Панель: https://vercel.com/nurzhan1/seora
- Проект Vercel: `nurzhan1/seora`

### GitHub

- **Репозиторий:** https://github.com/nurzhanch165-ux/seora
- Ветка: `main`
- Git подключён к Vercel → **авто-деплой при `git push`**

### Supabase

- **Организация:** `seora`
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

## 4. Дизайн-система

- Палитра (в `tailwind.config.ts`): тёплая «бумажная» база `paper #F4F1EA`, поверхности `surface`, текст `ink #1A1A17`, приглушённый `muted`, акцент-терракота `accent #9B5B3F`, статусные цвета `sale`, `success`.
- Стиль — luxury-минимализм (много воздуха, сериф-заголовки, сдержанный акцент).
- Глобальные классы в `src/app/globals.css`: `.btn-primary/.btn-outline/.btn-ghost/.btn-accent`, `.card`, `.field`, `.field-label`, `.chip`, `.eyebrow`, `.h-display`, `.container-site`, `.link-underline`.
- **Иконки нарисованы вручную** в `src/components/icons.tsx`.
- Обложка товара: `src/components/ProductVisual.tsx` — фото из Storage (`images[]`) или градиент с глифом.

---

## 5. Архитектура бэкенда (Supabase + серверные роуты)

### Схема БД

Полный SQL: `supabase/schema.sql` (применён к проекту через Supabase MCP).

**Таблицы:**
- `customers` — клиенты (`password_hash` bcrypt через pgcrypto, **никогда не отдаётся клиенту**)
- `products` — каталог (id текстом: `p01`, `h01`, добавленные — `ap...`)
- `orders` — заказы (`customer` и `delivery` как jsonb-снимки)
- `order_items` — позиции заказа

**RLS:**
- `products` — публичное чтение (anon)
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
| `POST /api/orders` | Создание заказа |
| `PATCH /api/orders/[id]` | Смена статуса / подтверждение оплаты (админ) |
| `POST /api/orders/[id]/screenshot` | Загрузка скриншота оплаты |
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
    api/                        серверные роуты (см. раздел 5)
    ...страницы как раньше...
  lib/
    supabase/                   client, admin, products, orders
    adminAuth.server.ts         серверная авторизация админа
    types.ts, excel.ts, format.ts, useHydrated.ts
  store/
    catalog.ts                  читает products из Supabase; админ-запись через API
    auth.ts                     RPC Supabase; current в localStorage (без пароля)
    orders.ts                   CRUD через API; скриншоты в Storage
    adminAuth.ts                cookie-сессия через /api/admin/*
    cart.ts, wishlist.ts        localStorage (без изменений)
  data/
    products.ts                 SEED (25 товаров); залит в БД через scripts/seed.ts
    categories.ts, brands.ts, site.ts
supabase/
  schema.sql                    полная схема БД + RPC + RLS
scripts/
  seed.ts                       заливка seed в Supabase (npx tsx scripts/seed.ts)
.env.example                    список env-переменных
```

---

## 7. Авторизация

### Клиенты

- Вход по **логину** (или телефону для старых аккаунтов) + пароль.
- Пароли хранятся как **bcrypt-хеш** в `customers.password_hash`.
- Браузер вызывает RPC через `getSupabase().rpc(...)` — хеш никогда не уходит на клиент.
- После входа в `store/auth.ts` хранится `current: Account` (без поля password) в localStorage (`seora-auth`).
- Регистрация, профиль, смена/сброс пароля — всё через RPC (см. `supabase/schema.sql`).

### Администратор

- Логин/пароль проверяются **на сервере** (`src/lib/adminAuth.server.ts`).
- Успешный вход → httpOnly-cookie `seora_admin` (sha256 от `ADMIN_LOGIN:ADMIN_PASSWORD`).
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

## 9. Заказы

- Создание: `POST /api/orders` при оформлении (`checkout/page.tsx`).
- Клиент видит свои заказы: `GET /api/orders?customerId=<uuid>`.
- Админ видит все: `GET /api/orders` (нужна cookie админа).
- Скриншот оплаты: `POST /api/orders/[id]/screenshot` → Storage `payment-screenshots`.
- Подтверждение оплаты / смена статуса: `PATCH /api/orders/[id]` (админ).
- Excel по-прежнему генерируется на клиенте (`src/lib/excel.ts`).

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

## 12. Известные ограничения и следующие шаги

### Ограничения

1. Авторизация клиентов — **кастомная** (логин/пароль в таблице, не Supabase Auth). Для enterprise-безопасности можно мигрировать на Supabase Auth.
2. «Забыли пароль» — сверка логина + телефона, без SMS/email.
3. Категории — по-прежнему в `data/categories.ts` (не в БД, не редактируются админом).
4. Корзина и избранное — только в браузере (localStorage).
5. Next.js 14.2.5 — есть security advisory; стоит обновить при удобном случае.
6. Свой домен (`seora.kz` и т.д.) — не подключён; можно добавить в Vercel → Settings → Domains.

### План развития (приоритеты)

1. Подключить **свой домен** (если есть).
2. **Ротация** `service_role` ключа Supabase (если утекал).
3. Серверные роли (админ / менеджер / склад).
4. Онлайн-оплата.
5. Уведомления (email, Telegram, WhatsApp).
6. Мультиязычность (`next-intl`).
7. Оптовые клиенты, минимальная сумма заказа.
8. SSR/metadata для страниц товаров (сейчас клиентские для чтения из Supabase).

---

## 13. Важные технические детали

- Товары: id `p01`, `h01`; добавленные админом — `ap...`. Витрина — `useCatalogProducts()` из `store/catalog.ts`.
- localStorage ключи: `seora-cart`, `seora-wishlist`, `seora-auth` (только `current`, без пароля). Старые ключи `seora-orders`, `seora-catalog`, `seora-admin-auth` больше не используются.
- Страницы с `useSearchParams` обёрнуты в `<Suspense>`.
- `scripts/` исключён из `tsconfig.json` (не ломает `next build`).
- `npm run build` на Windows в песочнице Cursor может не писать `.next` — запускать с полными правами.
- Supabase MCP в Cursor: авторизация через OAuth; организация `seora`, project ref `tmdakiocltbfjawkdwdw`.

---

## 14. Подсказка для нового чата

Проект **уже на Supabase + Vercel + GitHub**. Хорошие следующие задачи:

- «Подключить домен seora.kz к Vercel»
- «Добавить уведомления в Telegram при новом заказе»
- «Обновить Next.js до последней безопасной версии»
- «Перенести категории в Supabase и дать админу их редактировать»
- «Добавить мультиязычность (рус/каз/кор)»

При работе с Supabase — использовать **Supabase MCP** (уже авторизован) и skill `supabase/SKILL.md`.
