const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
 
export function spriteHref(iconId) {
  return `${BASE}/images/sprite.svg#${iconId}`;
}