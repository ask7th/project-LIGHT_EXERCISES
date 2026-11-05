# Favorites Page — Technical Documentation

**Issue:** #10 **Developer:** @fedorstoiets **Branch:** `feature/favorites`

## Scope

Implements rows 32–34 of the Your Energy technical specification.

### Requirements completed

- [x] Row 32 — Favorites page layout, Quote of the Day, daily exercise
      information, and saved exercises section.
- [x] Row 33 — Display exercises saved in localStorage and show an appropriate
      empty-state message.
- [x] Row 34 — Exercise cards with name, calories, body part, target, Start
      button, and removal button.

All three requirements were manually verified on the local implementation.

## Files

- `src/favorites.html` — page structure.
- `src/css/favorites.css` — responsive styling.
- `src/favorites.js` — storage handling, rendering, API requests, and
  interactions.

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/favorites.html`.

Production build:

```bash
npm run build
```

## Favorites data contract

Storage key: `energy-favorites`.

Storage format: JSON array of complete exercise objects from the backend API.

Agreed shared functions:

- `getFavorites()`
- `isFavorite()`
- `toggleFavorite()`

Agreed browser events:

- `favorites:change` — contains `detail.favorites`.
- `exercise:open` — contains `detail.id`.

The current implementation works independently. Integration with the shared
storage module and shared exercise modal remains pending.

## Testing

Manual tests completed:

- [x] Favorites page loads.
- [x] Daily quote loads.
- [x] Empty-state message displays.
- [x] Real exercise can be stored and displayed.
- [x] Saved exercise persists after page refresh.
- [x] Exercise details modal opens using the backend API.
- [x] Exercise can be removed from Favorites.
- [x] Empty state returns after removal.
- [x] Vite production build succeeds.

Tested with the real exercise `3/4 sit-up`, ID `64f389465ae26083f39b17a2`.

The test exercise with the invented ID `test-exercise-001` is not a valid API
resource and must not be used to test backend exercise details.

## Integration dependencies

1. Home exercise cards must store exercises using the agreed data contract.
2. Shared Favorites storage needs to replace standalone storage handling.
3. Shared exercise modal needs to replace or integrate with the local modal.
4. Shared header and footer should replace duplicate standalone markup.

These dependencies do not prevent independent testing of the Favorites page.

## Known limitations

- Full integration with other feature branches has not been verified.
- Shared-component integration remains pending.
- Responsive layout has been implemented but has not been fully documented
  through device-specific testing.

## Acceptance status

The requirements assigned to Issue #10 have passed local functional testing.

**Full-project integration remains subject to team review.**
