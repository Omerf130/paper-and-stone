# Department Landing — Deferred Admin / CMS Requirements

These items are explicitly out of scope for the Department Landing correction and should be handled in future Admin/CMS batches.

## A. Product taxonomy assignment

Admin Product create/edit must eventually require a valid **leaf-category** assignment.

The UX should not necessarily require three separate dropdowns. If Admin selects **Sofas**, the system should already know:

`Sofas → Seating → Living`

Prefer selecting the valid leaf category and deriving ancestors from taxonomy.

## B. Category management

Admin will later need controls for managing taxonomy/category content (names, hierarchy visibility, sort order, activation rules beyond product-driven availability).

## C. Category card images

Admin will later be able to upload/change the image representing each category on **Department Landing** pages.

The current card layout reserves a quiet neutral image area ready for this without another redesign.

## D. Mega-menu / department editorial image

Admin will later be able to change the large editorial image shown inside each Department mega menu.

**Category-card image** and **Department mega-menu image** are separate media concepts.

## E. Multilingual

The upcoming Hebrew/English phase must support taxonomy content without making either language individually mandatory.

Content may exist as Hebrew only, English only, or both.

Avoid new assumptions that would block optional per-locale fields.
