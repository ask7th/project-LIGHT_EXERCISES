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

export function renderPagination({
  container,
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (!totalPages || totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;
  const pages = getPageNumbers(currentPage, totalPages);

  container.innerHTML = `
        <button class="pagination-nav-btn" type="button" data-action="first" ${isFirst ? 'disabled' : ''} aria-label="First page">«</button>
        <button class="pagination-nav-btn" type="button" data-action="prev" ${isFirst ? 'disabled' : ''} aria-label="Previous page">‹</button>
        ${pages
          .map(page =>
            page === '...'
              ? `<span class="pagination-ellipsis">...</span>`
              : `<button class="pagination-btn ${page === currentPage ? 'active' : ''}" type="button" data-page="${page}">${page}</button>`
          )
          .join('')}
        <button class="pagination-nav-btn" type="button" data-action="next" ${isLast ? 'disabled' : ''} aria-label="Next page">›</button>
        <button class="pagination-nav-btn" type="button" data-action="last" ${isLast ? 'disabled' : ''} aria-label="Last page">»</button>
    `;

  container.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = Number(btn.dataset.page);
      if (page !== currentPage) onPageChange(page);
    });
  });

  container
    .querySelectorAll('.pagination-nav-btn:not([disabled])')
    .forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        let nextPage = currentPage;

        if (action === 'first') nextPage = 1;
        else if (action === 'prev') nextPage = Math.max(1, currentPage - 1);
        else if (action === 'next')
          nextPage = Math.min(totalPages, currentPage + 1);
        else if (action === 'last') nextPage = totalPages;

        if (nextPage !== currentPage) onPageChange(nextPage);
      });
    });
}
