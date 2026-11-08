/** Favorites page; uses the team's shared exercise modal and quote. */
import { EXERCISE_MODAL, EVENTS } from './constants.js';
import { spriteHref } from './sprite.js';
import { renderPagination } from './pagination.js';
const STORAGE_KEY = EXERCISE_MODAL.FAVORITES_KEY;
const PER_PAGE = 10;
let currentPage = 1;

const list = document.querySelector('#favorites-list');
const empty = document.querySelector('#favorites-empty');
const count = document.querySelector('#favorites-count');
const message = document.querySelector('#favorites-message');
const paginationContainer = document.querySelector('#favorites-pagination');

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
      new CustomEvent(EXERCISE_MODAL.FAVORITES_CHANGED_EVENT, {
        detail: items,
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

function safeText(value, fallback = '-') {
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
  const trash = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  trash.setAttribute('width', '18');
  trash.setAttribute('height', '18');
  trash.setAttribute('aria-hidden', 'true');
  const trashUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  trashUse.setAttribute('href', spriteHref('icon-trash'));
  trash.append(trashUse);
  remove.append(trash);
  remove.type = 'button';
  remove.dataset.action = 'remove';
  remove.dataset.id = id;
  remove.setAttribute(
    'aria-label',
    `Remove ${safeText(exercise.name, 'exercise')} from favorites`
  );
  const start = createElement('button', 'start-button');
  const startLabel = createElement('span', '', 'Start');
  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  arrow.setAttribute('viewBox', '0 0 24 24');
  arrow.setAttribute('width', '24');
  arrow.setAttribute('height', '24');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.classList.add('start-arrow');
  const arrowUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  arrowUse.setAttribute('href', spriteHref('icon-favorites-start-arrow'));
  arrow.append(arrowUse);
  start.append(startLabel, arrow);
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
  const sportImg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  sportImg.setAttribute('width', '22');
  sportImg.setAttribute('height', '22');
  sportImg.setAttribute('aria-hidden', 'true');
  const runnerUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  runnerUse.setAttribute('href', spriteHref('icon-run'));
  sportImg.append(runnerUse);
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
  showMessage('');

  const items = getFavorites();

  const totalPages = Math.ceil(items.length / PER_PAGE);

  if (currentPage > totalPages) {
    currentPage = Math.max(1, totalPages);
  }

  count.textContent = formatCount(items.length);

  empty.hidden = items.length > 0;
  list.hidden = items.length === 0;

  if (items.length === 0) {
    paginationContainer.innerHTML = '';
    list.replaceChildren();
    return;
  }

  list.replaceChildren(...items.map(createExerciseCard));

  renderPagination({
    container: paginationContainer,
    currentPage,
    totalPages,
    onPageChange: page => {
      currentPage = page;
      renderFavorites();
    },
  });

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = startIndex + PER_PAGE;

  const paginatedItems = items.slice(startIndex, endIndex);

   list.replaceChildren(...paginatedItems.map(createExerciseCard));

  renderPagination({
    container: paginationContainer,
    currentPage,
    totalPages,
    onPageChange: page => {
      currentPage = page;
      renderFavorites();
    },
  });  
}

function removeFavorite(id) {
  const items = getFavorites();
  const updated = items.filter(item => String(item._id ?? item.id) !== id);
  if (updated.length !== items.length && saveFavorites(updated)) {
    renderFavorites();
  }
}

function openExercise(id) {
  document.dispatchEvent(
    new CustomEvent(EVENTS.EXERCISE_OPEN, { detail: { id } })
  );
}

let initialized = false;

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

  document.addEventListener(EXERCISE_MODAL.FAVORITES_CHANGED_EVENT, renderFavorites);
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) renderFavorites();
  });
}

export function showFavorites() {
  initFavorites();
  renderFavorites();
}
