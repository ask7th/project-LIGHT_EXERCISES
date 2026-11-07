import { spriteHref } from './sprite.js';
import { getExercises } from './api.js';
import { EVENTS, PAGINATION } from './constants.js';
import { showLoader, hideLoader } from './loader.js';

const exercisesList = document.getElementById('exercises-container');
const exercisesWrapper = document.querySelector('.exercises-wrapper');
const categoriesWrapper = document.querySelector('.categories-wrapper');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const selectedCategoryName = document.getElementById('selected-category-name');
const categorySlash = document.getElementById('category-slash');
const paginationContainer = document.getElementById('pagination-container');

let currentFilter = '';
let currentCategory = '';
let currentKeyword = '';
let currentPage = 1;

const getLimit = () => window.innerWidth >= 768 ? PAGINATION.EXERCISES_DESKTOP : PAGINATION.EXERCISES_MOBILE;

document.addEventListener(EVENTS.CATEGORY_SELECTED, async (event) => {
    const { filter, category } = event.detail;
    currentFilter = filter;
    currentCategory = category;
    currentPage = 1;
    currentKeyword = '';

    selectedCategoryName.textContent = category;
    categorySlash.classList.remove('visually-hidden');

    if (categoriesWrapper) categoriesWrapper.classList.add('visually-hidden');
    if (exercisesWrapper) exercisesWrapper.classList.remove('visually-hidden');

    if (searchForm) {
        searchForm.classList.remove('visually-hidden');
        searchForm.reset();
        if (searchClearBtn) searchClearBtn.hidden = true;
    }

    await fetchAndRenderExercises();
});

async function fetchAndRenderExercises() {
    try {
        showLoader();

        const filterKey = currentFilter.toLowerCase().replace(/\s+/g, '');
        const apiParam = filterKey === 'bodyparts' ? 'bodypart' : filterKey;

        const queryParams = {
            [apiParam]: currentCategory,
            keyword: currentKeyword,
            page: currentPage,
            limit: getLimit(),
        };

        const data = await getExercises(queryParams);

        if (!data || data.results.length === 0) {
            exercisesList.innerHTML = '<p class="no-results">Sorry, no exercises found.</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        renderExerciseCards(data.results);
        renderPagination(data.totalPages);
    } catch (err) {
        console.error(err);
    } finally {
        hideLoader();
    }
}

function renderExerciseCards(exercises) {
    exercisesList.innerHTML = exercises
        .map(({ _id, name, burnedCalories, bodyPart, target, rating }) => `
            <li class="exercise-card">
                <div class="ex-card-header">
                    <div class="ex-badge">WORKOUT</div>
                    <div class="ex-rating">
                        ${rating.toFixed(1)}
                        <svg width="14" height="14" aria-hidden="true"><use href="${spriteHref('icon-star')}"></use></svg>
                    </div>
                    <button class="ex-start-btn" data-id="${_id}">
                        Start →
                    </button>
                </div>
                <h3 class="ex-title">
                    <span class="ex-icon-wrap">
                        <svg class="ex-icon" width="14" height="16" aria-hidden="true"><use href="${spriteHref('icon-run')}"></use></svg>
                    </span>
                    ${name}
                </h3>
                <div class="ex-info">
                    <p>Burned calories: <span>${burnedCalories} / 3 min</span></p>
                    <p>Body part: <span>${bodyPart}</span></p>
                    <p>Target: <span>${target}</span></p>
                </div>
            </li>
        `)
        .join('');

    exercisesList.querySelectorAll('.ex-start-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.dispatchEvent(
                new CustomEvent(EVENTS.EXERCISE_OPEN, { detail: { id: btn.dataset.id } })
            );
        });
    });
}

function getPageNumbers(current, total) {
    if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1);

    let start = Math.max(1, current - 1);
    let end = Math.min(total, start + 2);
    start = Math.max(1, end - 2);

    const pages = [];
    if (start > 1) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total) pages.push('...');
    return pages;
}

function renderPagination(totalPages) {
    if (!totalPages || totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPages;
    const pages = getPageNumbers(currentPage, totalPages);

    paginationContainer.innerHTML = `
        <button class="pagination-nav-btn" type="button" data-action="first" ${isFirst ? 'disabled' : ''} aria-label="First page">«</button>
        <button class="pagination-nav-btn" type="button" data-action="prev" ${isFirst ? 'disabled' : ''} aria-label="Previous page">‹</button>
        ${pages.map(page =>
            page === '...'
                ? `<span class="pagination-ellipsis">...</span>`
                : `<button class="pagination-btn ${page === currentPage ? 'active' : ''}" type="button" data-page="${page}">${page}</button>`
        ).join('')}
        <button class="pagination-nav-btn" type="button" data-action="next" ${isLast ? 'disabled' : ''} aria-label="Next page">›</button>
        <button class="pagination-nav-btn" type="button" data-action="last" ${isLast ? 'disabled' : ''} aria-label="Last page">»</button>
    `;

    paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            currentPage = Number(btn.dataset.page);
            await fetchAndRenderExercises();
        });
    });

    paginationContainer.querySelectorAll('.pagination-nav-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.dataset.action;
            if (action === 'first') currentPage = 1;
            else if (action === 'prev') currentPage = Math.max(1, currentPage - 1);
            else if (action === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else if (action === 'last') currentPage = totalPages;
            await fetchAndRenderExercises();
        });
    });
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (currentCategory) {
            currentPage = 1;
            fetchAndRenderExercises();
        }
    }, 300);
});

if (searchInput && searchClearBtn) {
    searchInput.addEventListener('input', () => {
        searchClearBtn.hidden = !searchInput.value.trim();
    });

    searchClearBtn.addEventListener('click', async () => {
        searchInput.value = '';
        searchClearBtn.hidden = true;
        currentKeyword = '';
        currentPage = 1;
        await fetchAndRenderExercises();
        searchInput.focus();
    });
}

if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentKeyword = e.target.elements.query.value.trim().toLowerCase();
        currentPage = 1;
        await fetchAndRenderExercises();
    });
}