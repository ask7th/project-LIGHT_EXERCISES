import { fetchExerciseById } from './api.js';
import { isFavorite, toggleFavorite } from './favorites-storage.js';

let currentExercise = null;
let lastTrigger = null;
let openToken = 0;

const refs = {};

export function initExerciseModal() {
  refs.modal = document.querySelector('[data-exercise-modal]');
  refs.dialog = document.querySelector('[data-modal-dialog]');
  refs.content = document.querySelector('[data-modal-content]');
  refs.closeButtons = document.querySelectorAll('[data-modal-close]');

  if (!refs.modal || !refs.content) {
    return;
  }

  refs.closeButtons.forEach(button => {
    button.addEventListener('click', closeExerciseModal);
  });

  refs.modal.addEventListener('click', onModalClick);
  refs.content.addEventListener('click', onFavoriteClick);
  document.addEventListener('exercise:open', event => {
    openExerciseModal(event.detail?.id);
  });
}

async function openExerciseModal(id) {
  if (!id || !refs.modal) {
    return;
  }

  const token = ++openToken;
  lastTrigger = document.activeElement;
  currentExercise = null;
  refs.modal.hidden = false;
  document.body.classList.add('is-modal-open');
  document.removeEventListener('keydown', onKeydown);
  document.addEventListener('keydown', onKeydown);
  renderStatus('Loading...');
  refs.dialog?.focus();

  try {
    const exercise = await fetchExerciseById(id);

    if (token !== openToken) {
      return;
    }

    currentExercise = exercise;
    renderExercise(exercise);
  } catch {
    if (token !== openToken) {
      return;
    }

    currentExercise = null;
    renderStatus('Could not load this exercise. Please try again.');
  }
}

function closeExerciseModal() {
  if (!refs.modal || refs.modal.hidden) {
    return;
  }

  openToken += 1;
  refs.modal.hidden = true;
  document.body.classList.remove('is-modal-open');
  document.removeEventListener('keydown', onKeydown);
  refs.content.replaceChildren();
  currentExercise = null;

  if (lastTrigger instanceof HTMLElement) {
    lastTrigger.focus();
  }
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    closeExerciseModal();
  }
}

function onModalClick(event) {
  if (event.target === refs.modal || event.target.closest('[data-modal-backdrop]')) {
    closeExerciseModal();
  }
}

function onFavoriteClick(event) {
  const button = event.target.closest('[data-favorite-toggle]');

  if (!button || !currentExercise) {
    return;
  }

  const added = toggleFavorite(currentExercise);
  button.classList.toggle('is-favorite', added);
  button.setAttribute('aria-pressed', String(added));
  button.querySelector('[data-favorite-label]').textContent = added
    ? 'Remove from favorites'
    : 'Add to favorites';
  button
    .querySelector('[data-heart-icon]')
    ?.setAttribute('href', added ? '#icon-heart-filled' : '#icon-heart');
}

function renderStatus(text) {
  refs.content.innerHTML = `<p class="exercise-modal-status">${escapeHtml(text)}</p>`;
}

function renderExercise(exercise) {
  const favorite = isFavorite(exercise._id);
  const gifUrl = safeUrl(exercise.gifUrl);
  const minutes = Number(exercise.time) || 3;

  refs.content.innerHTML = `
    <div class="exercise-modal-layout">
      ${
        gifUrl
          ? `<img class="exercise-modal-gif" src="${gifUrl}" alt="${escapeHtml(exercise.name)}" />`
          : ''
      }
      <div class="exercise-modal-info">
        <h2 class="exercise-modal-title" id="exercise-modal-title">${escapeHtml(exercise.name)}</h2>
        <div class="exercise-modal-rating">
          <span>${formatRating(exercise.rating)}</span>
          ${renderStars(exercise.rating)}
        </div>
        <ul class="exercise-modal-stats">
          ${statItem('Target', exercise.target)}
          ${statItem('Body Part', exercise.bodyPart)}
          ${statItem('Equipment', exercise.equipment)}
          ${statItem('Popular', exercise.popularity)}
          ${statItem('Burned calories', `${Number(exercise.burnedCalories) || 0} / ${minutes} min`)}
        </ul>
        <p class="exercise-modal-description">${escapeHtml(exercise.description)}</p>
        <button
          class="exercise-favorite${favorite ? ' is-favorite' : ''}"
          type="button"
          data-favorite-toggle
          aria-pressed="${favorite}"
        >
          <span data-favorite-label>${
            favorite ? 'Remove from favorites' : 'Add to favorites'
          }</span>
          ${heartSvg(favorite)}
        </button>
      </div>
    </div>
  `;
}

function statItem(label, value) {
  return `
    <li>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </li>
  `;
}

function renderStars(rating) {
  const value = Number(rating) || 0;
  const stars = Array.from({ length: 5 }, (_, index) => {
    const fill = Math.min(Math.max(value - index, 0), 1);
    return `
      <span class="modal-star" style="--fill: ${fill}">
        <svg width="18" height="18" aria-hidden="true">
          <use href="#icon-star"></use>
        </svg>
        <svg class="modal-star-fill" width="18" height="18" aria-hidden="true">
          <use href="#icon-star"></use>
        </svg>
      </span>
    `;
  }).join('');

  return `<span class="modal-stars" aria-label="Rating ${formatRating(value)} out of 5">${stars}</span>`;
}

function formatRating(rating) {
  const value = Number(rating);
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

function safeUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href;
    }
  } catch {
    return '';
  }

  return '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function heartSvg(favorite) {
  const href = favorite ? '#icon-heart-filled' : '#icon-heart';

  return `
    <svg width="18" height="18" aria-hidden="true">
      <use data-heart-icon href="${href}"></use>
    </svg>
  `;
}
