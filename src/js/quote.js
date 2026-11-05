const QUOTE_URL = 'https://your-energy.b.goit.study/api/quote';
const STORAGE_KEY = 'daily_quote';

export async function fetchAndRenderQuote() {
  const textEl = document.querySelector('.js-quote-text');
  const authorEl = document.querySelector('.js-quote-author');
  
  if (!textEl || !authorEl) return;

  const date = new Date();
  const today = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

  // Безпечне читання з localStorage
  let savedData = null;
  try {
    savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    console.error('Invalid quote data in localStorage:', error);
  }

  if (savedData && savedData.date === today) {
    textEl.textContent = savedData.quote;
    authorEl.textContent = savedData.author;
    return;
  }

  try {
    const response = await fetch(QUOTE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    const data = await response.json();
    
    const { author, quote } = data;

    textEl.textContent = quote;
    authorEl.textContent = author;

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