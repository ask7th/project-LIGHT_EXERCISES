let activeRequests = 0;

function getLoaderEl() {
  let el = document.querySelector('.js-loader');
  if (!el) {
    el = document.createElement('div');
    el.className = 'js-loader loader';
    el.innerHTML = '<div class="loader__spinner"></div>';
    el.style.display = 'none';
    document.body.appendChild(el);
  }
  return el;
}

export function showLoader() {
  activeRequests++;
  getLoaderEl().style.display = 'flex';
}

export function hideLoader() {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    getLoaderEl().style.display = 'none';
  }
}
