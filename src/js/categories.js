import { getFilters } from './api.js';
import { EVENTS } from './constants.js';
import { showLoader, hideLoader } from './loader.js';

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
        renderPagination(data.totalPages);
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
                    <img src="${imgURL}" alt="${name}" class="category-img" loading="lazy" />
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
            await fetchAndRenderCategories();
        });
    });

    paginationContainer.querySelectorAll('.pagination-nav-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.dataset.action;
            if (action === 'first') currentPage = 1;
            else if (action === 'prev') currentPage = Math.max(1, currentPage - 1);
            else if (action === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else if (action === 'last') currentPage = totalPages;
            await fetchAndRenderCategories();
        });
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