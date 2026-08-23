# Frontend Folder Architecture

Keep files inside the module that owns the feature. Create folders only when needed.

## Where To Put Files

- `pages/`: route-level screens used directly by `router/index.ts`.
- `details/`: detail screens like `EventDetailView.vue`.
- `forms/`: reusable forms like `EventForm.vue`.
- `sections/`: large page parts like headers, summaries, filters, or ledgers.
- `components/`: small feature-only UI like cards, rows, filters, and panels.
- `feature.api.ts`: API calls for that module.
- `feature.store.ts`: Pinia store for that module.

Shared UI used in many places goes in `src/components/common`.

## Naming Rules

- Route components end with `View.vue`: `BookingHistoryView.vue`.
- Reusable components use the feature name first: `BookingSummaryCard.vue`.
- Forms end with `Form.vue`: `SignupForm.vue`.
- Sections end with `Section.vue`: `WalletBalanceSection.vue`.
- API files use the module name: `booking.api.ts`.
- Store files use the module name: `booking.store.ts`.

## Import Rules

Prefer aliases for cross-module imports:

```ts
import AppButton from '@/components/common/AppButton.vue';
import { useWalletStore } from '@/modules/wallet/wallet.store';
```

Use relative imports inside the same module:

```ts
import { useBookingStore } from '../booking.store';
import BookingSummaryCard from '../components/BookingSummaryCard.vue';
```

## Checklist For Adding A New Feature File

1. Decide which module owns the behavior.
2. Put route screens in `pages/` or `details/`.
3. Extract repeated page pieces into `components/`, `forms/`, or `sections/`.
4. Keep API calls in `feature.api.ts`.
5. Keep state in `feature.store.ts`.
6. Update `router/index.ts` only for route-level `View.vue` files.
7. Run `npm run build` before pushing.
