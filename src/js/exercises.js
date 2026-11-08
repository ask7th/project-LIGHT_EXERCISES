import { fetchExercises } from './api.js';

const EMPTY_MESSAGE =
  'Unfortunately, no results were found. You may want to consider other search options to find the exercise you are looking for. Our range is wide and you have the opportunity to find more than one exercise for you!';

const state = {
  filter: 'Muscles',
  category: '',
  keyword: '',
  page: 1,
  totalPages: 1,
  open: false,
};

let requestId = 0;
let perPage = getExercisesPerPage();

const refs = {};

export function initExercises() {
  refs.section = document.querySelector('[data-exercises]');
  refs.back = document.querySelector('[data-exercises-back]');
  refs.category = document.querySelector('[data-current-category]');
  refs.search = document.querySelector('[data-exercise-search]');
  refs.list = document.querySelector('[data-exercise-list]');
  refs.message = document.querySelector('[data-exercises-message]');
  refs.pagination = document.querySelector('[data-pagination]');
  refs.categories = document.querySelector('[data-categories]');

  if (!refs.list) {
    return;
  }

  refs.back?.addEventListener('click', closeExercises);
  refs.search?.addEventListener('submit', onSearchSubmit);
  refs.list.addEventListener('click', onListClick);
  refs.pagination?.addEventListener('click', onPaginationClick);

  document.addEventListener('exercises:open', event => {
    openExercises(event.detail || {});
  });
  document.addEventListener('exercises:close', closeExercises);
  document.addEventListener('filters:change', closeExercises);

  window.addEventListener('resize', onResize);
}

export function openExercises({ filter = 'Muscles', category = '' } = {}) {
  if (!category) {
    return;
  }

  state.filter = filter;
  state.category = category;
  state.keyword = '';
  state.page = 1;
  state.open = true;

  if (refs.search) {
    refs.search.reset();
    refs.search.hidden = false;
  }

  if (refs.category) {
    refs.category.hidden = false;
    refs.category.textContent = formatLabel(category);
  }

  refs.categories?.setAttribute('hidden', '');
  loadExercises();
}

export function closeExercises() {
  if (!state.open && !refs.list?.children.length) {
    return;
  }

  state.open = false;
  state.category = '';
  state.keyword = '';
  state.page = 1;

  if (refs.search) {
    refs.search.reset();
    refs.search.hidden = true;
  }

  if (refs.category) {
    refs.category.hidden = true;
    refs.category.textContent = '';
  }

  refs.list.replaceChildren();
  hideMessage();
  renderPagination(1);

  if (refs.categories) {
    refs.categories.hidden = false;
  }
}

function onSearchSubmit(event) {
  event.preventDefault();

  if (!state.open) {
    return;
  }

  const formData = new FormData(event.currentTarget);
  state.keyword = String(formData.get('keyword') || '').trim();
  state.page = 1;
  loadExercises();
}

function onListClick(event) {
  const button = event.target.closest('[data-exercise-open]');

  if (!button) {
    return;
  }

  document.dispatchEvent(
    new CustomEvent('exercise:open', {
      detail: { id: button.dataset.exerciseOpen },
    })
  );
}

function onPaginationClick(event) {
  const button = event.target.closest('[data-page]');

  if (!button || button.disabled) {
    return;
  }

  const nextPage = Number(button.dataset.page);

  if (!nextPage || nextPage === state.page) {
    return;
  }

  state.page = nextPage;
  loadExercises();
  refs.section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function onResize() {
  const nextPerPage = getExercisesPerPage();

  if (nextPerPage === perPage || !state.open) {
    perPage = nextPerPage;
    return;
  }

  perPage = nextPerPage;
  state.page = 1;
  loadExercises();
}

async function loadExercises() {
  const currentRequest = ++requestId;
  showMessage('Loading...');
  refs.list.replaceChildren();
  renderPagination(state.totalPages);

  try {
    const data = await fetchExercises({
      filter: state.filter,
      category: state.category,
      keyword: state.keyword,
      page: state.page,
      limit: perPage,
    });

    if (currentRequest !== requestId) {
      return;
    }

    const results = Array.isArray(data.results) ? data.results : [];
    state.totalPages = Number(data.totalPages) || 1;

    if (!results.length) {
      showMessage(EMPTY_MESSAGE);
      renderPagination(1);
      return;
    }

    hideMessage();
    refs.list.insertAdjacentHTML(
      'beforeend',
      results.map(renderExerciseCard).join('')
    );
    renderPagination(state.totalPages);
  } catch {
    if (currentRequest !== requestId) {
      return;
    }

    showMessage('Something went wrong. Please try again.');
    renderPagination(1);
  }
}

function renderExerciseCard(exercise) {
  const calories = Number(exercise.burnedCalories) || 0;
  const minutes = Number(exercise.time) || 3;

  return `
    <li class="exercise-card">
      <div class="exercise-card-top">
        <p class="exercise-rating">
          <span>${formatRating(exercise.rating)}</span>
          ${starSvg()}
        </p>
        <button
          class="exercise-start"
          type="button"
          data-exercise-open="${escapeHtml(exercise._id)}"
        >
          Start
          ${arrowSvg()}
        </button>
      </div>
      <div class="exercise-name-row">
        <span class="exercise-badge">
          ${workoutSvg()}
          Workout
        </span>
        <h3 class="exercise-name">${escapeHtml(exercise.name)}</h3>
      </div>
      <ul class="exercise-meta">
        <li><span>Burned calories:</span> ${calories} / ${minutes} min</li>
        <li><span>Body part:</span> ${escapeHtml(exercise.bodyPart)}</li>
        <li><span>Target:</span> ${escapeHtml(exercise.target)}</li>
      </ul>
    </li>
  `;
}

function renderPagination(totalPages) {
  if (!refs.pagination) {
    return;
  }

  if (!state.open || totalPages <= 1) {
    refs.pagination.hidden = true;
    refs.pagination.replaceChildren();
    return;
  }

  const items = getPageItems(state.page, totalPages)
    .map(item => {
      if (item === 'gap') {
        return '<span class="pagination-gap">...</span>';
      }

      const isCurrent = item === state.page;
      return `
        <button
          class="pagination-btn${isCurrent ? ' is-current' : ''}"
          type="button"
          data-page="${item}"
          ${isCurrent ? 'aria-current="page"' : ''}
        >
          ${item}
        </button>
      `;
    })
    .join('');

  refs.pagination.hidden = false;
  refs.pagination.innerHTML = `
    <button
      class="pagination-btn pagination-arrow"
      type="button"
      data-page="${state.page - 1}"
      aria-label="Previous page"
      ${state.page === 1 ? 'disabled' : ''}
    >
      ${chevronSvg('left')}
    </button>
    ${items}
    <button
      class="pagination-btn pagination-arrow"
      type="button"
      data-page="${state.page + 1}"
      aria-label="Next page"
      ${state.page === totalPages ? 'disabled' : ''}
    >
      ${chevronSvg('right')}
    </button>
  `;
}

function getPageItems(current, total) {
  const pages = new Set([1, total, current - 1, current, current + 1]);

  if (current <= 3) {
    pages.add(2);
    pages.add(3);
  }

  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
  }

  const sorted = [...pages]
    .filter(page => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const items = [];
  let previous = 0;

  sorted.forEach(page => {
    if (previous && page - previous > 1) {
      items.push('gap');
    }

    items.push(page);
    previous = page;
  });

  return items;
}

function showMessage(text) {
  if (!refs.message) {
    return;
  }

  refs.message.hidden = false;
  refs.message.textContent = text;
}

function hideMessage() {
  if (!refs.message) {
    return;
  }

  refs.message.hidden = true;
  refs.message.textContent = '';
}

export function getExercisesPerPage() {
  if (window.matchMedia('(min-width: 1200px)').matches) {
    return 9;
  }

  if (window.matchMedia('(min-width: 768px)').matches) {
    return 10;
  }

  return 8;
}

function formatLabel(value) {
  const text = String(value || '');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatRating(rating) {
  const value = Number(rating);
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function starSvg() {
  return `
    <svg class="exercise-star" width="18" height="18" aria-hidden="true">
      <use href="#icon-star"></use>
    </svg>
  `;
}

function arrowSvg() {
  return `
    <svg class="exercise-arrow" width="16" height="16" aria-hidden="true">
      <use href="#icon-arrow"></use>
    </svg>
  `;
}

function workoutSvg() {
  return `
    <svg width="14" height="14" aria-hidden="true">
      <use href="#icon-run"></use>
    </svg>
  `;
}

function chevronSvg(direction) {
  const href = direction === 'left' ? '#icon-chevron-left' : '#icon-chevron';
  return `
    <svg width="16" height="16" aria-hidden="true">
      <use href="${href}"></use>
    </svg>
  `;
}
