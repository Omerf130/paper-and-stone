# Demo 16 — Admin CMS for Public Content

Structured CMS foundation for Paper & Stone marketing content. Admin controls copy, imagery, and presentation inside predefined layouts — not a page builder.

## Sub-Phases

| Phase | Scope | Status |
|-------|-------|--------|
| **16A** | CMS foundation — types, models, validation, defaults, read helpers | Complete |
| **16B** | CMS media upload + Site Settings admin editor + public Header/Footer | Complete |
| **16C** | Homepage admin editor | Complete |
| **16D** | Public homepage CMS integration | Complete |
| **16E** | Catalog CMS + cleanup + final regression | Complete |

## Ownership Boundaries

### Code-owned
- Routes and layouts
- Navigation labels and system UI copy
- Application behavior and workflows

### CMS-owned
- Marketing copy and imagery
- Contact information (email, phone, WhatsApp, address)
- CTA labels and internal targets
- Section visibility
- Validated homepage section ordering

### Business-data-owned
- Products (`Product.isFeatured` for featured products)
- Categories, Materials, Colors
- Professionals, Projects, Quotes

Never duplicate business entities into CMS documents.

## Singleton Strategy

Each CMS collection uses an explicit singleton key with a unique index:

| Collection | Key value |
|------------|-----------|
| `SiteSettings` | `"site"` |
| `HomepageContent` | `"homepage"` |
| `CatalogPageContent` | `"catalog"` |

Reads and future upserts always filter by `key`. Never use `findOne({})` as identity.

## Schema Overview

### SiteSettings
- `brandName`, optional `logo` (CmsImage)
- Optional contact: `contactEmail`, `contactPhone`, `whatsappPhone`, `address`
- `footerDescription`, optional `copyrightCompanyName`
- Optional basic SEO: `defaultTitle`, `defaultDescription`
- `schemaVersion` (default `1`)

### HomepageContent
Structured sections: `hero`, `categories`, `featuredProducts`, `about`, `professionals`, `inspiration`, `closing`

- `sectionOrder` — validated array of known section keys; hero must remain first
- Per-section visibility (`isVisible`) separate from order
- Category tiles may reference `Category._id` for presentation; business Category owns slug/identity
- Featured products section holds copy/CTA only — **no product ID list**
- `schemaVersion` (default `1`)

### CatalogPageContent
- `eyebrow`, `heading`, `supportingText` only
- No products, filters, pagination, or empty-state CMS copy

## Shared Embedded Types

### CmsImage
- `url`, `storageKey`, optional `alt`, `isDecorative`, optional dimensions
- Non-decorative images require alt text on validated writes

### CmsCta
- `label`, `href`, optional `isVisible`
- Internal paths only (`/...`); rejects external, protocol-relative, `javascript:`, `data:` URLs

## Default / Fallback Strategy

**Lazy defaults** — no destructive seed.

- If no CMS document exists, read helpers return typed defaults mirroring current hardcoded public copy
- Public site continues rendering existing components until integration phases
- First admin save (16B+) upserts the singleton document without overwriting existing admin content automatically

## Validation

Centralized Zod validation in `src/lib/cms/cms-validation.ts`:
- Singleton keys
- Text length limits
- CTA safety via `src/lib/cms/cms-cta-validation.ts`
- Section order rules (known keys, no duplicates, hero first)
- Category ObjectId validation and duplicate prevention
- CmsImage accessibility semantics

## Read Helpers

- `getSiteSettings()` — `src/lib/cms/get-cms-content.ts`
- `getHomepageContent()`
- `getCatalogPageContent()`

Each performs key-scoped lookup, merges with defaults, and returns plain serializable view types.

## Serialization

`src/lib/cms/map-cms-to-view.ts` maps lean Mongoose documents to view types. No `_id`, `__v`, or Mongoose metadata leaks to public components.

## Deferred (Not in 16A)

- Admin CMS navigation and editor pages
- CMS image upload via Vercel Blob
- Public homepage/header/footer/catalog integration
- Logo rendering
- Section reorder UI / drag-and-drop
- Draft/publish workflow
- Content history / revisions
- Rich text / HTML
- Navigation label CMS
- Catalog empty-state CMS
- External CTA URLs
- Media library collection

## Future Public Integration (16D+)

- Fetch `SiteSettings` once in public layout for Header/Footer
- Parallel fetch: `HomepageContent`, featured products, category relations for configured tiles
- Category tile links: `/products?category={category.slug}` when `categoryId` is linked

## Key Files

```
src/types/cms-content.ts
src/lib/cms/cms-constants.ts
src/lib/cms/cms-cta-validation.ts
src/lib/cms/cms-validation.ts
src/lib/cms/cms-defaults.ts
src/lib/cms/merge-cms-content.ts
src/lib/cms/map-cms-to-view.ts
src/lib/cms/get-cms-content.ts
src/models/cms/cms-schemas.ts
src/models/SiteSettings.ts
src/models/HomepageContent.ts
src/models/CatalogPageContent.ts
```

Public section components and catalog hero now consume CMS props (16D–16E). `homepage-data.ts` remains seed input for defaults only.

## Demo 16B — Site Settings + CMS Media

### Admin routes
- `/admin/content` — content hub (active: הגדרות אתר)
- `/admin/content/site` — Site Settings editor
- Admin nav group: **תוכן** → `/admin/content`

### Site Settings editor
Sections: מותג (brandName, logo), פרטי קשר (optional email/phone/WhatsApp/address), Footer, SEO בסיסי.

Save: `updateSiteSettingsAction` — requireAdmin, Zod field validation, singleton upsert by `key: "site"`, toast feedback.

Logo: managed via CMS media actions (immediate DB persist); text fields via form save.

### CMS media pipeline
Reuses Vercel Blob client-upload pattern from product media:
- `prepareCmsImageUploadAction` → `upload()` → `/api/admin/cms/media/upload`
- Token validation: admin auth, allowlisted scope, pathname namespace, MIME/size
- Replace lifecycle: upload Blob → persist MongoDB → best-effort delete old Blob
- Remove lifecycle: clear MongoDB → best-effort delete Blob

**16B writable scope:** `site.logo` only. Future scopes defined in constants but not writable yet.

**Storage paths:** `cms/{scope}/{field}/{uuid}-{safeFilename}` (e.g. `cms/site/logo/...`)

**Limits:** JPEG/PNG/WebP, 5 MB max. No SVG.

### Public layout integration
- `(public)/layout.tsx` fetches `getPublicSiteSettings()` once, passes `PublicSiteSettingsView` to Header/Footer
- **No `force-dynamic` on layout**
- `getPublicSiteSettings()` wraps `getSiteSettings()` in `unstable_cache` with tag `site-settings`
- Admin editor uses uncached `getSiteSettings()` for fresh edit data
- After save/logo mutations: `revalidateTag("site-settings")` + targeted `revalidatePath`

**Caching rationale:** Raw MongoDB in layout would implicitly dynamic-render all public routes including `/login` and `/register`. Cached fetch preserves static auth pages while tag revalidation updates Header/Footer after Admin changes.

### Public serialization
`mapSiteSettingsToPublic()` strips `storageKey` and internal metadata. Logo alt defaults to `brandName` when absent.

### Product media regression boundary
Product upload paths, slot semantics, and mutations unchanged. CMS uses separate API route and `cms/` namespace.

## Demo 16C — Homepage Admin Editor

### Admin routes
- `/admin/content` — content hub (הגדרות אתר + דף הבית)
- `/admin/content/homepage` — structured Homepage editor

### Editor architecture
- Vertical sections with anchor navigation (Hero, קטגוריות, מוצרים נבחרים, אודות, אנשי מקצוע, השראה, סיום, סדר הסקשנים)
- **Independent section saves** — each section has its own form state, validation, Save button, and toast
- Partial MongoDB upserts via focused `$set` paths on `{ key: "homepage" }`; untouched sections preserved
- First section save creates singleton from defaults + saved section when no document exists

### Stable array item IDs
- Category tiles, inspiration items, and professional steps require stable `id` (UUID)
- **Default items use fixed literal UUIDs** in `cms-default-item-ids.ts` — never generated at runtime when building defaults
- Admin-created items use `crypto.randomUUID()` on the client when adding array entries
- Media targeting for category/inspiration images uses stable item ID in storage path

### Category relationship
- Tiles reference real `Category._id`; optional `displayTitle` override
- Duplicate `categoryId` rejected server-side
- Inactive/missing referenced categories show Admin warning; tiles are not auto-removed

### Featured Products section
- Presentation only (eyebrow, heading, supporting text, CTA, visibility)
- No product IDs in CMS; link to `/admin/products` for featured selection via `Product.isFeatured`

### CMS media scopes (16C writable)
- `homepage.hero`, `homepage.about`, `homepage.professionals`
- `homepage.category` + `itemId`, `homepage.inspiration` + `itemId`
- Paths: `cms/homepage/hero/...`, `cms/homepage/categories/{itemId}/...`, etc.
- Image upload persists immediately to MongoDB; text fields in same section untouched
- New array items: image upload disabled until section saved (orphan safety)

### Section visibility and order
- Visibility toggles on all sections except Hero (always visible, always first)
- Section order editor with Up/Down controls; Hero row disabled; explicit Save order action

### Defaults banner
When no persisted `HomepageContent` document exists, editor loads merged defaults and shows informational banner.

### Public integration boundary (16D)
**16C prepared revalidation only.** Public homepage CMS integration is documented in the 16D section below.

## Demo 16D — Public Homepage CMS Integration

### Public loader
- `getPublicHomepageContent()` wraps `loadPublicHomepageContentUncached()` in `unstable_cache` with tag `homepage-content`
- Inner loader: `getHomepageContent()` merge + batch Category lookup for referenced tile IDs + `mapHomepageToPublic()`
- `(public)/page.tsx` removed `force-dynamic`; parallel fetch with `getFeaturedProducts()`

### Public view mapping
- Types in `src/types/public-homepage-content.ts` — no `storageKey`, `schemaVersion`, or singleton `key`
- About body split on first `\n\n` → lead + body paragraphs (Demo 14 markup preserved)
- Category tiles resolved from live Category `nameHe`, `slug`, `isActive`
- Active linked tiles link to `/products?category={slug}`; inactive/missing/unlinked tiles are non-clickable

### Inspiration demo-note rule
- Narrow field: `inspiration.isContentManaged` (default `false`)
- Set `true` only when Admin saves the Inspiration section (`saveHomepageInspiration`)
- Saving Hero, Categories, or other sections does **not** hide the demo note
- Public mapper: `showDemoNote = !isContentManaged`

### Section order and visibility
- `buildVisibleHomepageSections()` applies CMS `sectionOrder`, per-section `isVisible`, and hides Featured when zero featured products
- Hero always rendered even if omitted from stored order

### Cache + revalidation
- `revalidateHomepagePaths()` revalidates tag `homepage-content` + `/admin/content/homepage` + `/`
- Triggered by Homepage CMS saves/media mutations (16C) and **Category create/update** (including `isActive` changes via edit form)
- SiteSettings cache remains separate; `/products` is not broadly revalidated from Category mutations

### Presentation components
- All seven homepage sections accept typed CMS props; `homepage-data.ts` remains seed input for defaults only
- Shared `PublicCmsImage` for CMS images with placeholder fallback

### 16E boundary
Catalog CMS public integration, Catalog admin editor, and homepage-specific SEO fields remain deferred.

## Demo 16E — Catalog CMS + Final Regression

### Admin catalog editor
- Route: `/admin/content/catalog`
- Hub entry: **עמוד המוצרים** on `/admin/content`
- Single form for `eyebrow`, `heading`, `supportingText`
- Singleton upsert on `{ key: "catalog" }` via `updateCatalogPageContentAction`
- Defaults banner when no persisted document exists

### Public catalog integration
- `getPublicCatalogPageContent()` — cached loader with tag `catalog-content`
- `mapCatalogToPublic()` strips `key` / `schemaVersion`
- `/products` fetches catalog CMS in parallel with categories + products
- `CatalogHero` accepts typed CMS props; Demo 13 layout unchanged
- Removed explicit `force-dynamic`; page remains dynamic via `searchParams` + product queries

### Final CMS caching strategy

| Domain | Tag | Public loader | Revalidate helper |
|--------|-----|---------------|-------------------|
| SiteSettings | `site-settings` | `getPublicSiteSettings()` | `revalidateSiteSettingsPaths()` |
| HomepageContent | `homepage-content` | `getPublicHomepageContent()` | `revalidateHomepagePaths()` |
| CatalogPageContent | `catalog-content` | `getPublicCatalogPageContent()` | `revalidateCatalogPaths()` |

### Final revalidation map
- Site Settings save/logo → site tag + `/`, `/products`, auth pages, admin site
- Homepage CMS save/media → homepage tag + `/`, admin homepage
- Category create/update → homepage tag + `/` (category tile data)
- Catalog save → catalog tag + `/products`, admin catalog

### Content ownership (final)
- **CMS:** Homepage marketing copy/images/order; Catalog hero text; Site brand/contact/footer/logo
- **Business data:** Products, Categories, Materials, Colors, Users, Professionals, Projects, Quotes
- **Code:** Routes, nav labels, search/filter/pagination, empty states, result summaries, system UI

### Intentional hardcoded exceptions
- `/products` static page metadata
- SiteSettings SEO fields (stored, not publicly integrated)
- Catalog search/filter/pagination UI labels
- Navigation labels in `mainNavItems`

### CMS media scopes (writable)
- `site.logo`
- `homepage.hero`, `homepage.about`, `homepage.professionals`, `homepage.category`, `homepage.inspiration`
- `catalog.hero` — known but **not writable** (text-only catalog CMS)

### Static content cleanup
- Homepage sections consume CMS props only; `homepage-data.ts` remains seed for `cms-defaults.ts`
- `CatalogHero` no longer owns duplicate marketing copy

### Demo 16 status
**Demo 16 (16A–16E) — COMPLETE**

### Deferred CMS features
- Catalog/search empty-state CMS copy
- Catalog hero images
- Homepage/catalog/public SEO integration
- Nav label/route CMS, rich text, page builder, draft/publish, revisions, media library, external CTAs
