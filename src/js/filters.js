import { EVENTS } from './constants.js';

const filterButtons = document.querySelectorAll('.filter-btn');

function setActiveFilter(btn) {
    filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
}

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setActiveFilter(btn);
        document.dispatchEvent(new CustomEvent(EVENTS.FILTER_CHANGED, {
            detail: { filter: btn.dataset.filter }
        }));
    });
});

const defaultBtn = document.querySelector('.filter-btn[data-filter="Muscles"]');
if (defaultBtn) {
    setActiveFilter(defaultBtn);
    setTimeout(() => {
        document.dispatchEvent(new CustomEvent(EVENTS.FILTER_CHANGED, {
            detail: { filter: 'Muscles' }
        }));
    }, 0);
}