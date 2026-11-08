import { getFilters } from './api.js';
import { EVENTS, PAGINATION } from './constants.js';
import { renderPagination } from './pagination.js';

const categoriesContainer = document.getElementById('categories-container');
const categoriesWrapper = document.querySelector('.categories-wrapper');
const exercisesWrapper = document.querySelector('.exercises-wrapper');
const searchForm = document.getElementById('search-form');
const paginationContainer = document.getElementById('pagination-container');
const categoriesStatus = document.getElementById('categories-status');

let currentFilter = 'Muscles';
let currentPage = 1;
let latestRequestId = 0;
let requestedLimit;

const getLimit = () => window.innerWidth < 768
    ? PAGINATION.CATEGORIES_MOBILE
    : PAGINATION.CATEGORIES_DESKTOP;

function setCategoriesLoading(isLoading) {
    categoriesWrapper.setAttribute('aria-busy', String(isLoading));
    paginationContainer.classList.toggle('pagination--loading', isLoading);
    paginationContainer.inert = isLoading;
}

document.addEventListener(EVENTS.CATEGORY_SELECTED, () => {
    latestRequestId++;
    setCategoriesLoading(false);
    categoriesStatus.textContent = '';
});

document.addEventListener(EVENTS.FILTER_CHANGED, async (e) => {
    currentFilter = e.detail.filter;
    currentPage = 1;

    if (exercisesWrapper) exercisesWrapper.classList.add('visually-hidden');
    if (categoriesWrapper) categoriesWrapper.classList.remove('visually-hidden');
    if (searchForm) searchForm.classList.add('visually-hidden');

    const categorySlash = document.getElementById('category-slash');
    const selectedCategoryName = document.getElementById('selected-category-name');
    if (categorySlash) categorySlash.classList.add('visually-hidden');
    if (selectedCategoryName) selectedCategoryName.textContent = '';

    await fetchAndRenderCategories();
});

async function fetchAndRenderCategories() {
    const requestId = ++latestRequestId;
    const filter = currentFilter;
    const page = currentPage;
    const limit = getLimit();
    requestedLimit = limit;

    setCategoriesLoading(true);
    categoriesStatus.textContent = `Loading ${filter.toLowerCase()} categories.`;
    categoriesContainer.innerHTML = Array.from({ length: limit }, () =>
        '<li class="category-item category-skeleton" aria-hidden="true"></li>'
    ).join('');

    try {
        const data = await getFilters({
            filter,
            page,
            limit,
        });

        if (requestId !== latestRequestId) return;

        if (!data || data.results.length === 0) {
            categoriesContainer.innerHTML = '<li class="categories-message no-results">No categories found.</li>';
            paginationContainer.innerHTML = '';
            categoriesStatus.textContent = 'No categories found.';
            return;
        }

        renderCategoryCards(data.results);
        renderCategoriesPagination(data.totalPages);
        categoriesStatus.textContent = `${filter} categories loaded. Page ${page}.`;
    } catch (err) {
        if (requestId !== latestRequestId) return;
        console.error(err);
        paginationContainer.innerHTML = '';
        categoriesContainer.innerHTML = `
            <li class="categories-message">
                <p>Unable to load categories. Please try again.</p>
                <button class="categories-retry-btn" type="button">Retry</button>
            </li>
        `;
        categoriesContainer.querySelector('.categories-retry-btn')
            .addEventListener('click', fetchAndRenderCategories);
        categoriesStatus.textContent = 'Unable to load categories. Please try again.';
    } finally {
        if (requestId === latestRequestId) setCategoriesLoading(false);
    }
}

function renderCategoryCards(categories) {
    categoriesContainer.innerHTML = categories
        .map(({ filter, name, imgURL }) => `
            <li class="category-item">
                <button class="category-card-btn" data-filter="${filter}" data-name="${name}">
                    <img src="${imgURL}" alt="${name}" class="category-img" loading="lazy" decoding="async" />
                    <div class="category-content">
                        <h3 class="category-name">${name}</h3>
                        <p class="category-label">${filter}</p>
                    </div>
                </button>
            </li>
        `)
        .join('');

    categoriesContainer.querySelectorAll('.category-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent(EVENTS.CATEGORY_SELECTED, {
                detail: {
                    filter: btn.dataset.filter,
                    category: btn.dataset.name,
                }
            }));
        });
    });
}

function renderCategoriesPagination(totalPages) {

  renderPagination({
    container: paginationContainer,
    currentPage,
    totalPages,
    onPageChange: async page => {
      currentPage = page;
      await fetchAndRenderCategories();
    },
  });
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (categoriesWrapper && !categoriesWrapper.classList.contains('visually-hidden')
            && getLimit() !== requestedLimit) {
            currentPage = 1;
            fetchAndRenderCategories();
        }
    }, 300);
});
