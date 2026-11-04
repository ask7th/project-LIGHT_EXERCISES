const QUOTE_URL = 'https://your-energy.b.goit.study/api/quote';
const STORAGE_KEY = 'daily_quote';

export async function fetchAndRenderQuote() {
  const textEl = document.querySelector('.js-quote-text');
  const authorEl = document.querySelector('.js-quote-author');
  
  if (!textEl || !authorEl) return;

  const today = new Date().toISOString().split('T')[0];
  const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));

  // Перевіряємо, чи є збережена цитата за сьогодні
  if (savedData && savedData.date === today) {
    textEl.textContent = savedData.quote;
    authorEl.textContent = savedData.author;
    return;
  }

  // Якщо даних немає або дата інша
  try {
    const response = await fetch(QUOTE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    const data = await response.json();
    
    const { author, quote } = data;

    textEl.textContent = quote;
    authorEl.textContent = author;

    // Зберігаємо в localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: today,
      quote,
      author
    }));
  } catch (error) {
    console.error('Error loading quote:', error);
    textEl.textContent = 'Could not load quote today. Stay active!';
  }
}