# 11 — Бекенд: схема БД + перехід SSG → ISR

Документ проєктування бекенду й підключення до нього фронтенду. Написано під поточний
контракт даних (`site/src/lib/types.ts`). **Джерело правди форми даних — Public DTO**:
БД зберігає що завгодно, але назовні (в API/лоадери) віддає **саме форму цих типів**.
Тоді підключення фронту — заміна лише лоадерів, без зміни компонентів.

СУБД у прикладах — **PostgreSQL** (найпортативніше). Схема легко мапиться на Prisma/Drizzle —
скажи, який ORM, згенерую відповідний варіант.

---

## 1. Принципи

- **DTO = контракт.** `PublicProduct`, `Category`, `PublicDocument`, `RequestPayload`,
  `PublicReview` з `types.ts` визначають, що бекенд зобовʼязаний віддати. Не міняємо їх заради БД —
  міняємо мапінг `row → DTO`.
- **Whitelist-проекція.** У БД можуть бути внутрішні поля (склад, собівартість, постачальник) —
  назовні йдуть **лише** колонки з DTO. Публічні вибірки фільтрують `is_published = true`
  і селектять whitelisted-колонки (див. §5).
- **PII окремо.** Заявки (`requests`) і персональні дані — лише на сервері; жодних PII у публічних DTO
  чи в кеші сторінок (OPSEC — `docs/04-logic §21–22`).
- **Стабільні зовнішні id.** Для конфігуратора/варіантів зберігаємо `ext_id` (як у DTO: `"antenna"`,
  `"int"`, `"ext-std"`) поряд із сурогатним PK — щоб форма DTO не залежала від автоінкрементів.

---

## 2. Огляд таблиць

```
categories 1─┬─* products ─┬─* product_images
             │             ├─* product_key_specs
             │             ├─* spec_groups ─* spec_items
             │             ├─* option_groups ─* options
             │             ├─* variants ─* variant_selections ─→ options
             │             ├─* product_relations ─→ products   (relatedSlugs, M:N)
             │             ├─* compatibility_links ─→ products (works_with/requires/…)
             │             ├─* documents            (PublicDocument)
             │             └─* reviews ─* review_media (майбутнє, OPSEC-модерація)
requests ─* request_items                            (PII, лише сервер)
```

---

## 3. Enum-типи (дзеркало union-типів із `types.ts`)

```sql
CREATE TYPE availability       AS ENUM ('in_stock','production_3_5d','on_order','temporarily_unavailable','check_with_manager');
CREATE TYPE price_type         AS ENUM ('from','exact','on_request');
CREATE TYPE option_group_type  AS ENUM ('single','multi');
CREATE TYPE relation_type      AS ENUM ('works_with','requires','recommended_addon');
CREATE TYPE document_type      AS ENUM ('pdf','docx','zip');
CREATE TYPE document_category  AS ENUM ('instructions','specifications','certificates','testing','software');
CREATE TYPE contact_channel    AS ENUM ('call','telegram','signal','whatsapp');
CREATE TYPE review_status      AS ENUM ('pending','approved','rejected');  -- OPSEC-модерація (04-logic §22)
CREATE TYPE request_status     AS ENUM ('new','in_progress','done','spam');
```

---

## 4. DDL

### 4.1 Каталог

```sql
CREATE TABLE categories (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        text NOT NULL UNIQUE,        -- Category.slug
  name        text NOT NULL,               -- Category.name
  description text NOT NULL DEFAULT '',     -- Category.description
  sort_order  int  NOT NULL DEFAULT 0       -- Category.order
);

CREATE TABLE products (
  id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug               text NOT NULL UNIQUE,          -- PublicProduct.slug
  name               text NOT NULL,                 -- name
  short_name         text,                          -- shortName («КОЖАН»)
  type_label         text,                          -- typeLabel («Детектор БПЛА»)
  short_description  text NOT NULL,                 -- shortDescription
  category_id        bigint NOT NULL REFERENCES categories(id),
  card_tags          text[] NOT NULL DEFAULT '{}',  -- cardTags
  use_cases          text[] NOT NULL DEFAULT '{}',  -- useCases
  badges             text[] NOT NULL DEFAULT '{}',  -- badges
  package_contents   text[] NOT NULL DEFAULT '{}',  -- packageContents
  price_type         price_type NOT NULL,           -- publicPrice.type
  price_amount       integer,                       -- publicPrice.amount (грн); NULL для on_request
  currency           text NOT NULL DEFAULT 'UAH',
  availability       availability NOT NULL,         -- availability
  warranty_months    int NOT NULL DEFAULT 12,       -- warrantyMonths
  default_variant_id bigint,                         -- Configuration.defaultVariantId (FK нижче)
  is_published       boolean NOT NULL DEFAULT false, -- whitelist-видимість
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON products (category_id);
CREATE INDEX ON products (is_published);

CREATE TABLE product_images (          -- PublicProduct.publicImages[]
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        text NOT NULL,            -- ProductImage.src
  alt        text NOT NULL DEFAULT '',
  width      int,
  height     int,
  sort_order int NOT NULL DEFAULT 0
);
CREATE INDEX ON product_images (product_id);

CREATE TABLE product_key_specs (       -- PublicProduct.keySpecs[]
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label      text NOT NULL,
  value      text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
CREATE INDEX ON product_key_specs (product_id);

CREATE TABLE spec_groups (             -- publicSpecifications[].group
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title      text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
CREATE INDEX ON spec_groups (product_id);

CREATE TABLE spec_items (              -- publicSpecifications[].items[]
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id   bigint NOT NULL REFERENCES spec_groups(id) ON DELETE CASCADE,
  label      text NOT NULL,
  value      text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
CREATE INDEX ON spec_items (group_id);
```

### 4.2 Конфігуратор (Configuration)

```sql
CREATE TABLE option_groups (           -- OptionGroup
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ext_id     text NOT NULL,            -- OptionGroup.id («antenna»)
  label      text NOT NULL,
  type       option_group_type NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (product_id, ext_id)
);

CREATE TABLE options (                 -- ConfigOption
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  option_group_id bigint NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
  ext_id          text NOT NULL,       -- ConfigOption.id («int»)
  label           text NOT NULL,       -- людська назва («Вбудовані»)
  price_delta     integer NOT NULL DEFAULT 0,
  sort_order      int NOT NULL DEFAULT 0,
  UNIQUE (option_group_id, ext_id)
);

CREATE TABLE variants (                -- Variant
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id   bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ext_id       text NOT NULL,          -- Variant.id («ext-std»)
  sku          text NOT NULL UNIQUE,   -- Variant.sku
  price        integer NOT NULL,       -- Variant.price
  availability availability NOT NULL,  -- Variant.availability
  UNIQUE (product_id, ext_id)
);
CREATE INDEX ON variants (product_id);

CREATE TABLE variant_selections (      -- Variant.options: Record<optionGroupId, optionId>
  variant_id bigint NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  option_id  bigint NOT NULL REFERENCES options(id),
  PRIMARY KEY (variant_id, option_id)
);

-- default_variant_id вказує на variants(id) — FK додаємо після створення variants
ALTER TABLE products
  ADD CONSTRAINT products_default_variant_fk
  FOREIGN KEY (default_variant_id) REFERENCES variants(id) ON DELETE SET NULL;
```

### 4.3 Звʼязки продуктів

```sql
CREATE TABLE product_relations (       -- PublicProduct.relatedSlugs (M:N, self)
  product_id         bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, related_product_id),
  CHECK (product_id <> related_product_id)
);

CREATE TABLE compatibility_links (     -- CompatibilityLink
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id        bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relation          relation_type NOT NULL,
  note              text,
  UNIQUE (product_id, target_product_id, relation)
);
```

### 4.4 Документація (PublicDocument)

```sql
CREATE TABLE documents (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ext_id       text NOT NULL UNIQUE,   -- PublicDocument.id («doc-01»)
  title        text NOT NULL,
  type         document_type NOT NULL,
  category     document_category NOT NULL,
  product_id   bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,  -- productSlug → FK
  version      text NOT NULL,
  updated_at   date NOT NULL,          -- PublicDocument.updatedAt (ISO-дата)
  size_bytes   bigint NOT NULL,
  url          text NOT NULL DEFAULT '#',  -- файл у сховищі/CDN (поки заглушка)
  is_published boolean NOT NULL DEFAULT true
);
CREATE INDEX ON documents (product_id);
CREATE INDEX ON documents (category);
```

> `productName`/`productTypeLabel` у `DocumentView` — НЕ колонки: беруться JOIN-ом до `products`
> (див. §6). У БД `documents` тримає лише `product_id`.

### 4.5 Відгуки (PublicReview) — майбутнє, з модерацією

```sql
CREATE TABLE reviews (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id   bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_name text NOT NULL,          -- позивний/роль — НІКОЛИ ПІБ
  role_label   text,
  rating       int CHECK (rating BETWEEN 1 AND 5),
  body         text NOT NULL,          -- PublicReview.text
  use_case_tag text,
  published_at text NOT NULL,          -- точність місяць «2026-03»
  verified     boolean NOT NULL DEFAULT true,
  status       review_status NOT NULL DEFAULT 'pending',  -- назовні лише 'approved'
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON reviews (product_id, status);

CREATE TABLE review_media (            -- PublicReview.media[]
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  review_id  bigint NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  media_type text NOT NULL,            -- 'photo' | 'video'
  src        text NOT NULL,
  poster     text
);
```

### 4.6 Заявки (RequestPayload) — PII, лише сервер

```sql
CREATE TABLE requests (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at      timestamptz NOT NULL DEFAULT now(),   -- record.receivedAt
  name            text NOT NULL,
  phone           text NOT NULL,
  contact_channel contact_channel NOT NULL,
  organization    text,
  comment         text,
  source_page     text,
  status          request_status NOT NULL DEFAULT 'new'
);
CREATE INDEX ON requests (created_at);
CREATE INDEX ON requests (status);

CREATE TABLE request_items (           -- RequestItem[]
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id      bigint NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  product_slug    text NOT NULL,       -- зберігаємо slug: історична цілісність навіть якщо продукт зникне
  qty             int NOT NULL CHECK (qty > 0),
  configuration   jsonb,               -- Record<optionGroupId, optionId>
  sku             text,
  price_at_submit integer
);
CREATE INDEX ON request_items (request_id);
```

---

## 5. Публічна проекція (whitelist)

Публічні читання завжди: `WHERE is_published` + вибірка лише DTO-колонок. Приклад для картки каталогу:

```sql
SELECT p.slug, p.name, p.short_name, p.type_label, p.card_tags,
       p.short_description, p.badges, p.availability,
       p.price_type, p.price_amount, p.currency,
       c.slug AS category_slug, c.name AS category_name
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.is_published
ORDER BY c.sort_order, p.name;
```

`publicPrice` збирається в мапері: `on_request` → `{type:'on_request'}`, інакше
`{type: price_type, amount: price_amount, currency}`. Внутрішні колонки (склад, собівартість —
якщо додаси) **ніколи** не потрапляють у SELECT публічних лоадерів.

---

## 6. Шов «фронт ↔ бекенд»

Змінюються **тільки** ці файли; компоненти й сторінкова розмітка — ні.

| Що | Файл сьогодні (читає JSON) | При підключенні |
|---|---|---|
| Контракт | `site/src/lib/types.ts` | без змін (джерело правди) |
| Каталог (читання) | `site/src/lib/catalog.ts` ← `data/products.json`,`categories.json` | ті самі функції, `async`, тягнуть із БД |
| Документи (читання) | `site/src/lib/documents.ts` ← `data/documents.json` | `async` + JOIN до products (enrich у SQL) |
| Заявка (запис) | `site/src/app/api/requests/route.ts` → `.data/requests.jsonl` | `INSERT` у `requests`/`request_items` |
| Клієнт БД | — | новий `site/src/lib/db.ts` (pg/Prisma/Drizzle, `import "server-only"`) |

**Приклад «до/після» — каталог:**

```ts
// СЬОГОДНІ (catalog.ts) — синхронно з JSON:
export function getProducts(): PublicProduct[] { return products; }

// ПРИ ПІДКЛЮЧЕННІ — async + кеш із тегом для ISR:
import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const getProducts = unstable_cache(
  async (): Promise<PublicProduct[]> => {
    const rows = await db.query(/* whitelist SELECT + JOIN images/specs/variants */);
    return rows.map(toPublicProduct);   // мапінг row → DTO; форма НЕ змінюється
  },
  ["catalog:products"],
  { tags: ["products"], revalidate: 300 },
);
```

Наслідки для викликів (механічні):
- `catalog/page.tsx`, `documentation/page.tsx` уже `async` — просто `await getProducts()` тощо.
- `products/[slug]/page.tsx`: `generateStaticParams` стає async — `return (await getProducts()).map(p => ({ slug: p.slug }))`; `getProduct(slug)` → `await getProduct(slug)`.
- `documents.ts`: `enrich` через `getProduct` замінюється на **JOIN у SQL** (`documents JOIN products`), щоб `getDocuments()` повертав `DocumentView[]` одним запитом.

**Запис заявки** (`api/requests/route.ts`): валідація, honeypot (`website`), rate-limit — лишаються;
міняється лише «хвіст» — замість `appendFile` у JSONL:

```ts
await db.tx(async (t) => {
  const { id } = await t.one(`INSERT INTO requests(name,phone,contact_channel,organization,comment,source_page)
                              VALUES($1,$2,$3,$4,$5,$6) RETURNING id`, [...]);
  for (const it of items) {
    await t.none(`INSERT INTO request_items(request_id,product_slug,qty,configuration,sku,price_at_submit)
                  VALUES($1,$2,$3,$4,$5,$6)`, [id, it.slug, it.qty, it.configuration ?? null, it.sku ?? null, it.priceAtSubmit ?? null]);
  }
});
```

Після переходу `.data/requests.jsonl` більше не потрібен (PII живе в БД). Сповіщення email/Telegram
(TODO у роуті) чіпляємо тут само.

---

## 7. План SSG → ISR (виконати «при підключенні»)

Зараз сторінки — SSG (JSON зашитий на збірці). Коли лоадери стануть асинхронними (БД), додаємо
`revalidate` — сторінки стають **ISR** (пре-рендер + фонове оновлення), зберігаючи SEO+швидкість.

| Сторінка | Зараз | Стане | `revalidate` | Примітка |
|---|---|---|---|---|
| `/catalog` | SSG | ISR | 300 c | + on-demand `revalidateTag('products')` |
| `/products/[slug]` | SSG + generateStaticParams | ISR + async generateStaticParams | 300 c | нові товари: on-demand або `dynamicParams` |
| `/documentation` | SSG | ISR | 300 c | тег `documents` |
| `/solutions`, `/about` | Static (контент у коді) | **без змін** | — | БД не потрібна |
| `/` (Головна) | буде | ISR | 300 c | коли надаси макет |
| наявність/залишки | — | **динамічно** | 0 | окремий client-fetch/route, щоб сторінка не «протухала» |

**У сторінці** (одна лінія):

```ts
export const revalidate = 300;           // ISR: фонове оновлення раз на 5 хв
```

**On-demand (миттєве оновлення на редагуваннях ERP)** — новий роут `app/api/revalidate/route.ts`:

```ts
import { revalidateTag } from "next/cache";
export async function POST(req: Request) {
  if (req.headers.get("x-revalidate-secret") !== process.env.REVALIDATE_SECRET)
    return new Response("forbidden", { status: 403 });
  const { tag } = await req.json();        // 'products' | 'documents'
  revalidateTag(tag);
  return Response.json({ revalidated: true });
}
```

ERP після зміни продукту/документа шле сюди POST — фронт оновлюється за секунди, а `revalidate:300` —
страхувальний фон. **Наявність/ціни, що змінюються часто**, краще не «запікати» в ISR: тягнути
окремим динамічним запитом (client-компонент або dynamic-сегмент), щоб важка сторінка лишалась статичною.

---

## 8. Порядок робіт (міграція)

1. Підняти PostgreSQL; застосувати цю схему як міграцію (Prisma/Drizzle/SQL — на вибір).
2. Написати мапери `row → DTO` (форма з `types.ts`) + `site/src/lib/db.ts` (`import "server-only"`).
3. Перемкнути `catalog.ts`/`documents.ts` на `async` + БД, обгорнути `unstable_cache({ tags })`.
4. Додати `export const revalidate` у сторінки даних; `generateStaticParams` зробити async.
5. Перемкнути `POST /api/requests` на `INSERT` у транзакції; прибрати JSONL.
6. Додати `app/api/revalidate` (webhook для ERP).
7. Демо-JSON у `data/` лишити як сід/фікстури для локалу й тестів.

Компоненти (`CatalogView`, `DocumentationView`, картки, шапка/футер) на всіх кроках — **без змін**:
вони приймають ті самі DTO.
