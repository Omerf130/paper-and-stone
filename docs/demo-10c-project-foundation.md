# Demo 10C — Project Foundation + Product Selection

Demo 10C introduces professional Project CRUD with embedded configured product items, draft-only lifecycle, and product-page "הוספה לפרויקט" integration.

## Ownership

- `Project.ownerUserId` references **User** (session identity)
- Never use `ProfessionalProfile` for authorization
- All mutations derive owner from `requireProfessional()` — no client-supplied `ownerUserId`

## Project schema

| Field | Notes |
|-------|-------|
| `ownerUserId` | ObjectId → User, indexed |
| `name` | Required |
| `clientName`, `location`, `description` | Optional |
| `status` | Enum; only `draft` used in 10C |
| `items[]` | Embedded ProjectItem subdocuments |

Indexes: `{ ownerUserId, updatedAt }`, `{ ownerUserId, status }`

## ProjectItem schema

References + minimal snapshot (hybrid):

| Field | Purpose |
|-------|---------|
| `productId` | Stable Product ObjectId |
| `selectedMaterialId` | Material ObjectId string or legacy key |
| `selectedColorId` | Color ObjectId string or legacy key |
| `selectedSizeKey` | Product `sizes[].key` |
| `quantity` | 1–999 |
| `snapshot` | `productName`, `productSlug`, optional names/hex/label/sku |

No Blob image URL snapshot — live product image resolved when available.

## Duplicate items

Exact match on `productId + selectedMaterialId + selectedColorId + selectedSizeKey` increments quantity via atomic `$inc`.

If combined quantity would exceed **999**, operation is **rejected** with Hebrew error (never clamped).

## Profile readiness

Before create/add: require `fullName` + `phone` on ProfessionalProfile.

## Routes

| Route | Purpose |
|-------|---------|
| `/professional/projects` | List own projects |
| `/professional/projects/new` | Create project |
| `/professional/projects/[id]` | Edit details + items |

Nav: **הפרויקטים שלי**

## Product page

- Professional: enabled "הוספה לפרויקט" + native `<dialog>` project picker
- Customer / admin / logged-out: no project action shown
- Products without material/size: quantity-only add block for professionals

## Stale/inactive sources

Existing items remain with snapshot text. Inactive products show "המוצר אינו פעיל". Edits require currently valid configuration.

## Future (10D+)

- Submit for approval, admin review, status workflow
- `ProjectMessage` collection for admin ↔ professional messaging
- Notifications, pricing
