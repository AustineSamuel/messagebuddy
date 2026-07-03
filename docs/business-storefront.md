# Business Storefront (Public Pages)

Each MessageBuddy business can publish a **public ecommerce-style storefront** at:

```
https://your-frontend-domain/{business-slug}
```

Product detail pages:

```
https://your-frontend-domain/{business-slug}/{product-slug}
```

Example: `https://messagebuddy.app/obis-electronics` shows the business landing page with all active products. Tapping a product opens its detail page with price, description, checkout, and WhatsApp/phone contact.

## Overview

```
Business owner → Settings → Online store (slug, logo, phone, SEO)
                → Products tab (active products)
Customer      → /{slug} landing page
                → /{slug}/{product} detail + checkout + WhatsApp
Search/social → generateMetadata() reads seoTitle, seoDescription, business name
```

## Business owner setup

In **Dashboard → Settings → Online store**:

| Field | Purpose |
|-------|---------|
| **Public store** toggle | When off, public API returns 404 |
| **Store URL slug** | URL path segment (auto-suggested from business name on first save) |
| **Contact phone** | Shown on storefront; used for `tel:` and WhatsApp links |
| **Tagline** | Hero headline on landing page |
| **Logo** | Upload (base64) or URL — header + Open Graph image |
| **Accent color** | Buttons, highlights, gradients |
| **SEO title / description** | `<title>`, meta description, Open Graph, Twitter cards |
| **Copy store link** | Full URL after slug is saved |

**Business Profile** fields also appear on the public site:

- **Business name** — title and branding
- **What you sell** — hero + About section
- **Address** — About / Contact sections
- **Website** — optional external link

Products come from **Dashboard → Products**. Only **active** products are listed publicly.

## Public API (no auth)

Base: `{API_URL}/api/v1/store/business`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/:businessSlug` | Business profile + active products |
| `GET` | `/:businessSlug/products/:productSlug` | Single product + business |
| `POST` | `/:businessSlug/products/:productSlug/checkout` | Record checkout interest (increments sold) |

Responses use the standard Adonis JSON envelope (`data`).

### Reserved slugs

These slugs cannot be used (also blocked on the Next.js route):  
`login`, `register`, `dashboard`, `shop`, `api`, `admin`, `settings`, `products`, `store`, etc.

## Database

Migration `1770100000000_add_storefront_fields_to_business_settings` adds to `business_settings`:

- `slug` (unique, nullable)
- `phone`, `logo_url`, `tagline`
- `seo_title`, `seo_description`
- `accent_color` (default `#25D366`)
- `public_store_enabled` (default `true`)

Run:

```bash
cd backend && npm run migrate
```

## Backend modules

| File | Role |
|------|------|
| `modules/storefront/services/storefront_service.ts` | Resolve slug, serialize public profile, WhatsApp helpers |
| `modules/storefront/controllers/storefront_controller.ts` | HTTP handlers |
| `modules/storefront/routes.ts` | Public routes |
| `modules/business_settings/services/business_settings_service.ts` | Slug validation, `storeUrl`, upsert |
| `modules/products/services/products_service.ts` | `listPublicForUser`, checkout URLs `/{slug}/{productSlug}` |

Authenticated settings: `GET/PUT /api/v1/business-settings`

## Frontend

| Path | Role |
|------|------|
| `src/app/[businessSlug]/page.tsx` | Landing — `generateMetadata` + SSR fetch |
| `src/app/[businessSlug]/BusinessStorefront.tsx` | Product grid, hero, about, contact |
| `src/app/[businessSlug]/[productSlug]/page.tsx` | Product detail — SEO metadata |
| `src/app/[businessSlug]/[productSlug]/BusinessProductPage.tsx` | Gallery, checkout, WhatsApp |
| `src/app/services/storefront.ts` | Public API client |
| `src/dashboard/components/settings/SettingsPage.tsx` | Online store customization |

### SEO

Server components call `generateMetadata()`:

1. Fetch business (and product) from the public API with `revalidate: 300`
2. Use `seoTitle` / `seoDescription` when set
3. Fall back to business name, tagline, description, product name + price
4. Open Graph images: product image → business logo

### Legacy shop URLs

Old links still work:

```
/shop/{userId}/{productSlug}
/api/v1/store/{userId}/products/{productSlug}
```

New checkout URLs in the dashboard use `/{businessSlug}/{productSlug}` when a slug exists.

## Environment

```env
# backend/.env
FRONTEND_URL=https://your-app.com

# frontend/.env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3333
```

`FRONTEND_URL` is used to build `storeUrl` returned in business settings API.

## Local development

1. Start backend and frontend
2. Open dashboard → Settings → fill Business Profile + Online store → Save
3. Add active products
4. Visit `http://localhost:3000/{your-slug}`

## Future improvements

- CDN logo upload instead of base64 in `logo_url`
- Redirect legacy `/shop/...` to `/{slug}/...` when slug exists
- Custom domain per business
- Product categories and search on storefront
