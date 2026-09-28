# HomeClinicStore (HCS2)

Verified dependency-free production website for HomeClinicStore.

## Run locally

```bash
npm run dev
```

## Validate and build

```bash
npm run validate
npm run build
```

The production build is written to `dist/`.

## Storefront redesign

The storefront uses a dark green palette, mint accents and responsive layouts inspired by Loydtech. It retains the original section anchors and three catalogue entries, with no framework or runtime dependencies added.

Product search and category filters work together. Device details open in keyboard-accessible dialogs. Visitors can add devices to a session-only enquiry list, remove them, and download a text enquiry draft. If browser storage is unavailable, the list works in memory until the page reloads. No payment, order processing or message sending is implemented.

Device illustrations and health dashboards are explicitly conceptual. Before enabling sales, supply verified product photographs, exact model specifications, prices, stock, compatibility, delivery and return terms, and a verified business contact channel. The site does not collect contact details or patient data. Fonts load from Google Fonts with local system-font fallbacks.

### Verification

- `npm run build` includes the repository validation checks.
- Browser review at desktop (1440px) and mobile (390px) sizes.
- Search, category filters, no-results state, product dialog, adding to enquiry list, and mobile menu opening/closing checked interactively.
- Enquiry download action produces its success state; the embedded browser did not expose a download completion event. Confirm file saving in the target deployment browser before release.
