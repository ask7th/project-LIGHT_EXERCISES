/** Favorites page for Your Energy.
 * Storage contract (shared with the exercise modal):
 * key: energy-favorites
 * value: JSON array of full exercise objects
 * event: favorites:change, event.detail.favorites
 * Start event: exercise:open, event.detail.id
 */
const STORAGE_KEY = 'energy-favorites';
const API_BASE = 'https://your-energy.b.goit.study/api';

const list = document.querySelector('#favorites-list');
const empty = document.querySelector('#favorites-empty');
const count = document.querySelector('#favorites-count');
const message = document.querySelector('#favorites-message');
const dialog = document.querySelector('#exercise-dialog');
const dialogContent = document.querySelector('#dialog-content');

/** The same fields expected by the shared favorites-storage module. */
function getFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(stored)
      ? stored.filter(
          item => item && typeof item === 'object' && (item._id || item.id)
        )
      : [];
  } catch (error) {
    console.warn('Could not read Favorites:', error);
    return [];
  }
}

function saveFavorites(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    document.dispatchEvent(
      new CustomEvent('favorites:change', {
        detail: { favorites: items },
      })
    );
    return true;
  } catch (error) {
    showMessage(
      'Unable to update favorites in this browser. Check storage permissions.'
    );
    console.error('Could not save Favorites:', error);
    return false;
  }
}

function showMessage(text) {
  message.textContent = text;
  message.hidden = !text;
}

function formatCount(value) {
  return `${value} exercise${value === 1 ? '' : 's'}`;
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = String(text);
  return el;
}

function safeText(value, fallback = '—') {
  return value === undefined || value === null || value === ''
    ? fallback
    : String(value);
}

function createExerciseCard(exercise) {
  const id = String(exercise._id ?? exercise.id);
  const card = createElement('article', 'exercise-card');
  const cardTop = createElement('div', 'exercise-card-top');
  const cardActions = createElement('div', 'exercise-card-actions');
  const badge = createElement('span', 'workout-badge', 'WORKOUT');
  const remove = createElement('button', 'remove-button');
  const trash = document.createElement('img');
  trash.src = './images/favorites-trash.svg';
  trash.alt = '';
  remove.append(trash);
  remove.type = 'button';
  remove.dataset.action = 'remove';
  remove.dataset.id = id;
  remove.setAttribute(
    'aria-label',
    `Remove ${safeText(exercise.name, 'exercise')} from favorites`
  );
  const start = createElement('button', 'start-button', 'Start →');
  start.type = 'button';
  start.dataset.action = 'open';
  start.dataset.id = id;
  start.setAttribute(
    'aria-label',
    `Open details for ${safeText(exercise.name, 'exercise')}`
  );
  cardActions.append(badge, remove);
  cardTop.append(cardActions, start);

  const titleRow = createElement('div', 'exercise-title-row');
  const sport = createElement('span', 'exercise-sport-icon');
  const sportImg = document.createElement('img');
  sportImg.src = './images/favorites-runner.svg';
  sportImg.alt = '';
  sport.append(sportImg);
  sport.setAttribute('aria-hidden', 'true');
  const title = createElement(
    'h3',
    'exercise-name',
    safeText(exercise.name, 'Exercise')
  );
  titleRow.append(sport, title);

  const stats = createElement('div', 'exercise-stats');
  const calories = createElement('p', '', 'Burned calories: ');
  calories.append(
    createElement('strong', '', `${safeText(exercise.burnedCalories)} / 3 min`)
  );
  const bodyPart = createElement('p', '', 'Body part: ');
  bodyPart.append(createElement('strong', '', safeText(exercise.bodyPart)));
  const target = createElement('p', '', 'Target: ');
  target.append(createElement('strong', '', safeText(exercise.target)));
  stats.append(calories, bodyPart, target);
  card.append(cardTop, titleRow, stats);
  return card;
}

function renderFavorites() {
  const items = getFavorites();
  count.textContent = formatCount(items.length);
  empty.hidden = items.length > 0;
  list.hidden = items.length === 0;
  list.replaceChildren(...items.map(createExerciseCard));
}

function removeFavorite(id) {
  const items = getFavorites();
  const updated = items.filter(item => String(item._id ?? item.id) !== id);
  if (updated.length !== items.length && saveFavorites(updated)) {
    showMessage('Exercise removed from favorites.');
    renderFavorites();
  }
}

// Fallback details display for running this page by itself.
// The shared details module can take ownership by calling event.preventDefault().
async function openExercise(id) {
  const event = new CustomEvent('exercise:open', {
    detail: { id },
    cancelable: true,
  });
  document.dispatchEvent(event);
  if (event.defaultPrevented) return;

  if (!dialog || typeof dialog.showModal !== 'function') return;
  dialogContent.replaceChildren(
    createElement('p', '', 'Loading exercise details…')
  );
  dialog.showModal();
  try {
    const response = await fetch(
      `${API_BASE}/exercises/${encodeURIComponent(id)}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const exercise = await response.json();
    if (!dialog.open) return;
    const heading = createElement(
      'h2',
      '',
      safeText(exercise.name, 'Exercise details')
    );
    heading.id = 'dialog-title';
    const fields = [
      ['Rating', exercise.rating],
      ['Target', exercise.target],
      ['Body part', exercise.bodyPart],
      ['Equipment', exercise.equipment],
      ['Calories / 3 min', exercise.burnedCalories],
      ['Popularity', exercise.popularity],
      ['Time', exercise.time],
    ];
    const body = createElement('div', 'dialog-fields');
    for (const [label, value] of fields) {
      if (value != null && value !== '')
        body.append(createElement('p', '', `${label}: ${value}`));
    }
    const description = createElement(
      'p',
      'dialog-description',
      safeText(exercise.description, 'No description available.')
    );
    dialogContent.replaceChildren(heading, body, description);
    if (
      typeof exercise.gifUrl === 'string' &&
      /^https:\/\//.test(exercise.gifUrl)
    ) {
      const img = document.createElement('img');
      img.src = exercise.gifUrl;
      img.alt = `Demonstration of ${safeText(exercise.name, 'exercise')}`;
      img.loading = 'lazy';
      img.className = 'dialog-image';
      dialogContent.insertBefore(img, body);
    }
  } catch (error) {
    console.error('Could not load exercise details:', error);
    if (dialog.open)
      dialogContent.replaceChildren(
        createElement(
          'p',
          '',
          'Exercise details are unavailable. Please try again.'
        )
      );
  }
}

async function loadDailyQuote() {
  const text = document.querySelector('#quote-text');
  const author = document.querySelector('#quote-author');
  const today = new Date().toLocaleDateString('en-CA');
  const cacheKey = 'energy-daily-quote';
  let quote;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (cached && cached.date === today && cached.quote) quote = cached.quote;
  } catch {
    /* use network instead */
  }
  if (!quote) {
    try {
      const response = await fetch(`${API_BASE}/quote`);
      if (!response.ok) return;
      quote = await response.json();
      localStorage.setItem(cacheKey, JSON.stringify({ date: today, quote }));
    } catch (error) {
      console.warn('Daily quote unavailable:', error);
      return;
    }
  }
  if (quote.quote || quote.text) text.textContent = quote.quote ?? quote.text;
  if (quote.author) author.textContent = quote.author;
}

let initialized = false;
let quoteLoaded = false;

export function initFavorites() {
  if (initialized || !list || !empty || !count || !message) return;
  initialized = true;

  list.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button || !list.contains(button)) return;
    const { action, id } = button.dataset;
    if (action === 'remove') removeFavorite(id);
    if (action === 'open') openExercise(id);
  });

  document.addEventListener('favorites:change', renderFavorites);
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) renderFavorites();
  });
  document
    .querySelector('#dialog-close')
    ?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
}

export function showFavorites() {
  initFavorites();
  renderFavorites();
  if (!quoteLoaded) {
    quoteLoaded = true;
    loadDailyQuote();
  }
}
