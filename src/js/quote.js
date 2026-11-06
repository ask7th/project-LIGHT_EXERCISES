import { spriteHref } from './sprite.js';
import quotePhotoUrl from '../images/hero/women-sportswear-taking-break-from-workout-1_mob.png';
import { getQuote } from './api.js';
import { LS_KEYS } from './constants.js';

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getCachedQuote() {
  const saved = localStorage.getItem(LS_KEYS.QUOTE);
  if (!saved) return null;

  const parsed = JSON.parse(saved);
  if (parsed.date === getTodayString()) {
    return parsed;
  }
  return null;
}

function saveQuoteToCache(data) {
  localStorage.setItem(
    LS_KEYS.QUOTE,
    JSON.stringify({ ...data, date: getTodayString() })
  );
}

function populateSidebarWrapper() {
  const wrapper = document.querySelector('.quote-wrapper');
  if (!wrapper || wrapper.innerHTML.trim()) return;

  wrapper.innerHTML = `
    <div class="quote-card">
      <div class="quote-card-top">
        <div class="quote-card-icon-wrap">
          <svg width="18" height="18" aria-hidden="true"><use href="${spriteHref('icon-run')}"></use></svg>
        </div>
        <p class="quote-card-title">Quote of the day</p>
        <svg class="quote-mark" width="24" height="24" aria-hidden="true"><use href="${spriteHref('icon-quote')}"></use></svg>
      </div>
      <blockquote class="quote-text"></blockquote>
      <p class="quote-author"></p>
    </div>
    <div class="quote-photo-wrap">
      <img
        src="${quotePhotoUrl}"
        srcset="${quotePhotoUrl} 2x"
        alt="Women working out"
        class="quote-photo"
        width="290"
        height="242"
      />
    </div>
    <div class="daily-norm-card">
      <div class="daily-norm-header">
        <div class="daily-norm-icon-wrap">
          <svg width="20" height="20" aria-hidden="true"><use href="${spriteHref('icon-dumbbell')}"></use></svg>
        </div>
        <div>
          <p class="daily-norm-time">110 min</p>
          <p class="daily-norm-subtitle">Daily norm of sports</p>
        </div>
      </div>
      <p class="daily-norm-text">The World Health Organization recommends at least 150 minutes of moderate-intensity aerobic physical activity throughout the week for adults aged 18-64. However, what happens if we adjust that number to 110 minutes every day? While it might seem like a high number to hit, dedicating 110 minutes daily to sporting activities may offer unparalleled benefits to physical health, mental well-being, and overall quality of life.</p>
    </div>
  `;
}

function renderQuote({ quote, author }) {
  document.querySelectorAll('.quote-text').forEach(el => {
    el.textContent = quote;
  });
  document.querySelectorAll('.quote-author').forEach(el => {
    el.textContent = author;
  });
}

function setupTextAdjustment() {
  const textEl = document.querySelector('.daily-norm-text');

  if (!textEl) {
    setTimeout(setupTextAdjustment, 100);
    return;
  }

  if (!textEl.dataset.originalText) {
    textEl.dataset.originalText = textEl.textContent.trim();
  }

  const original = textEl.dataset.originalText;

  function adjustText() {
    const w = window.innerWidth;
    const maxLen = w < 768 ? 169 : w < 1280 ? 179 : original.length;
    textEl.textContent =
      original.length > maxLen
        ? original.substring(0, maxLen).trim() + '...'
        : original;
  }

  adjustText();
  window.addEventListener('resize', adjustText);
}

export async function initQuoteSection() {
  try {
    let data = getCachedQuote();
    if (!data) {
      data = await getQuote();
      saveQuoteToCache(data);
    }
    populateSidebarWrapper();
    renderQuote(data);
    setupTextAdjustment();
  } catch (err) {
    console.error('initQuoteSection error:', err);
  }
}

initQuoteSection();
