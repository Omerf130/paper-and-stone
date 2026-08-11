# Demo 9B — Product Material/Color Assignment

Demo 9B connects Products to the central Material/Color library and migrates the public configurator from legacy embedded `fabrics[]` to `materialOptions`.

## Source of truth

- **Admin write path:** `Product.materialOptions[]` only
- **Public read path:** `materialOptions` when non-empty; legacy `fabrics[]` is a read-only fallback when `materialOptions` is empty
- **`Product.materials: string[]`** remains free-text spec lines (unchanged)
- Legacy `fabrics[]` is **not written** by ProductForm and is **not deleted** from MongoDB

## Product.materialOptions schema

```ts
materialOptions: [{
  materialId: ObjectId,      // ref Material
  allowedColorIds: ObjectId[] // subset of Material.colorIds
}]
```

Rules enforced server-side:

- No duplicate materials per product
- No duplicate colors within a material option
- At least one color per assigned material
- Colors must belong to the selected Material
- Inactive Material/Color retain-vs-new rules (mirror Category / Material patterns)

## Admin UI

- `MaterialOptionsEditor` replaces `FabricsEditor`
- Section title: **חומרים וצבעים**
- Pick materials/colors from `/admin/materials` and `/admin/colors`
- Inactive linked refs display as **(לא פעיל)** and remain if previously assigned

## Public ProductView

```ts
materialOptions: [{
  materialId, materialName, materialType,
  colors: [{ id, name, hex }]
}]
```

Configurator uses HEX swatches (`backgroundColor: color.hex`). Legend uses **חומר** (not בד).

## ProductVisual (pre-9C)

- If `primaryImage` exists → show image (color selection does not affect hero)
- If no image → `ProductVisual` with fixed neutral `"gray"`
- Selected HEX is **not** mapped to visualTone

## Demo seed colors (development only)

Seed data in `scripts/demo-seed-library.ts` provides Milano demo Colors/Materials.

**Important:** Demo seed HEX values are **not** authoritative Paper & Stone brand colors. The admin-maintained Color library is the production source of truth.

Seed behavior:

- Idempotent upsert by `code` (e.g. `DEMO-BLUE`, `DEMO-VELVET`)
- Uses `$setOnInsert` for Color/Material identity and content
- Re-running seed does **not** overwrite admin-edited library records
- Milano `materialOptions` are set via `$set`; legacy `fabrics[]` remain in DB untouched

## Legacy fallback

When `materialOptions.length === 0` and `fabrics.length > 0`:

- Public mapper uses `mapLegacyFabricsToMaterialOptionsView`
- Legacy colors receive neutral hex `#808080` (no tone→hex mapping)
- When `materialOptions` has at least one valid assignment, legacy `fabrics[]` is **not** merged

## Deferred (Demo 9C+)

- Mask upload + Canvas recolor
- Swatch texture images
- Catalog material/color filters
- Hard removal of `fabrics[]` schema field
