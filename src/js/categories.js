const BASE_URL = 'https://your-energy.b.goit.study/api/filters';
const listEl = document.querySelector('.js-categories-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const paginationContainer = document.querySelector('.js-pagination');

let currentFilter = 'Muscles';
let currentPage = 1;

async function fetchCategories(filter, page = 1, limit = 12) {
  try {
    const response = await fetch(`${BASE_URL}?filter=${filter}&page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    return data; // Повертаємо весь об'єкт (results, page, totalPages тощо)
  } catch (error) {
    console.error('Error fetching categories:', error);
    return null;
  }
}

async function renderCategories(filter, page = 1) {
  if (!listEl) return;
  
  listEl.innerHTML = '<li class="loading-text">Loading...</li>';

  const data = await fetchCategories(filter, page);

  if (!data || !data.results || data.results.length === 0) {
    listEl.innerHTML = '<li class="error-text">No categories found for this filter.</li>';
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  const { results, totalPages, page: resPage } = data;
  currentPage = Number(resPage);

  // Рендеринг сітки карток
  const markup = results
    .map(
      ({ name, filter, imgURL }) => `
    <li class="category-item" style="background-image: url('${imgURL}')" data-name="${name}">
      <div class="category-content">
        <h3 class="category-item-title">${name}</h3>
        <p class="category-item-subtitle">${filter}</p>
      </div>
    </li>
  `
    )
    .join('');

  listEl.innerHTML = markup;

  // Рендеринг пагінації
  renderPagination(currentPage, totalPages);
}

function renderPagination(currentPage, totalPages) {
  if (!paginationContainer) return;

  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let markup = '';
  for (let i = 1; i <= totalPages; i++) {
    markup += `
      <button class="page-btn ${i === Number(currentPage) ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }
  
  paginationContainer.innerHTML = markup;
}

export function initCategories() {
  renderCategories(currentFilter, currentPage);

  // Слухач подій на таби-фільтри
  filterBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      filterBtns.forEach(b => b.classList.remove('active'));
      
      const selectedBtn = e.currentTarget;
      selectedBtn.classList.add('active');

      currentFilter = selectedBtn.dataset.filter;
      currentPage = 1; // При зміні фільтра завжди скидаємо на 1-шу сторінку

      renderCategories(currentFilter, currentPage);
    });
  });

  // Слухач подій на кліки по пагінації
  if (paginationContainer) {
    paginationContainer.addEventListener('click', e => {
      if (e.target.tagName !== 'BUTTON') return;

      const selectedPage = Number(e.target.dataset.page);
      if (selectedPage === currentPage) return; // Якщо клікнули на ту ж сторінку — нічого не робимо

      currentPage = selectedPage;
      renderCategories(currentFilter, currentPage);
      
      // Плавний скролл до верху секції при зміні сторінки (опціонально для зручності)
      listEl.scrollIntoView({ behavior: 'smooth' });
    });
  }
}