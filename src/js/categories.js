import { getFilters } from './api.js';
import { EVENTS } from './constants.js';
import { showLoader, hideLoader } from './loader.js';
import { renderPagination } from './pagination.js';

const categoriesContainer = document.getElementById('categories-container');
const categoriesWrapper = document.querySelector('.categories-wrapper');
const exercisesWrapper = document.querySelector('.exercises-wrapper');
const searchForm = document.getElementById('search-form');
const paginationContainer = document.getElementById('pagination-container');

let currentFilter = 'Muscles';
let currentPage = 1;

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
    try {
        showLoader();

        const isMobile = window.innerWidth < 768;
        const limit = isMobile ? 9 : 12;

        const data = await getFilters({
            filter: currentFilter,
            page: currentPage,
            limit,
        });

        if (!data || data.results.length === 0) {
            categoriesContainer.innerHTML = '<p class="no-results">No categories found.</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        renderCategoryCards(data.results);
        renderCategoriesPagination(data.totalPages);
    } catch (err) {
        console.error(err);
    } finally {
        hideLoader();
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
        if (categoriesWrapper && !categoriesWrapper.classList.contains('visually-hidden')) {
            currentPage = 1;
            fetchAndRenderCategories();
        }
    }, 300);
});