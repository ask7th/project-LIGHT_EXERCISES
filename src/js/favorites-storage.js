export const FAVORITES_STORAGE_KEY = 'energy-favorites';

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavorite(id) {
  return getFavorites().some(item => item._id === id);
}

export function toggleFavorite(exercise) {
  const favorites = getFavorites();
  const exists = favorites.some(item => item._id === exercise._id);
  const next = exists
    ? favorites.filter(item => item._id !== exercise._id)
    : [...favorites, exercise];

  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
  document.dispatchEvent(
    new CustomEvent('favorites:change', {
      detail: { favorites: next },
    })
  );
  document.dispatchEvent(
    new CustomEvent('favorites:changed', {
      detail: next,
    })
  );

  return !exists;
}
