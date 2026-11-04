const BASE_URL = 'https://your-energy.b.goit.study/api/filters';
const listEl = document.querySelector('.js-categories-list');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'Muscles';

async function fetchCategories(filter, page = 1, limit = 12) {
  try {
    const response = await fetch(`${BASE_URL}?filter=${filter}&page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function renderCategories(filter) {
  if (!listEl) return;
  
  listEl.innerHTML = '<li class="loading-text">Loading...</li>';

  const categories = await fetchCategories(filter);

  if (!categories || categories.length === 0) {
    listEl.innerHTML = '<li class="error-text">No categories found for this filter.</li>';
    return;
  }

  const markup = categories
    .map(
      ({ name, filter, imgURL }) => `
    <li class="category-item" style="background-image: url('${imgURL}')" data-name="${name}">
      <div class="category-content">
        <h3 class="category-name">${name}</h3>
        <p class="category-filter">${filter}</p>
      </div>
    </li>
  `
    )
    .join('');

  listEl.innerHTML = markup;
}

export function initCategories() {
  renderCategories(currentFilter);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      filterBtns.forEach(b => b.classList.remove('active'));
      
      const selectedBtn = e.currentTarget;
      selectedBtn.classList.add('active');

      currentFilter = selectedBtn.dataset.filter;

      renderCategories(currentFilter);
    });
  });
}