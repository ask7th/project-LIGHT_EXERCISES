import axios from 'axios';

const BASE_URL = 'https://your-energy.b.goit.study/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/**
 * Перелік категорій за обраним фільтром.
 * @param {Object} params
 * @param {'Muscles'|'Body parts'|'Equipment'} params.filter
 * @param {number} [params.page=1]
 * @param {number} [params.limit=12]
 * @returns {Promise<{results: Array, page: number, perPage: number, totalPages: number}>}
 */
export async function getFilters({ filter, page = 1, limit = 12 }) {
  const { data } = await api.get('/filters', {
    params: { filter, page, limit },
  });
  return data;
}

/**
 * Список вправ за фільтром/категорією/keyword.
 * @param {Object} params
 * @param {string} [params.bodypart]
 * @param {string} [params.muscles]
 * @param {string} [params.equipment]
 * @param {string} [params.keyword]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 */
export async function getExercises(params = {}) {
  const { page = 1, limit = 10, ...rest } = params;
  const { data } = await api.get('/exercises', {
    params: { ...rest, page, limit },
  });
  return data;
}

/**
 * Детальна інформація про одну вправу.
 * @param {string} exerciseId
 */
export async function getExerciseById(exerciseId) {
  const { data } = await api.get(`/exercises/${exerciseId}`);
  return data;
}

/**
 * Додати рейтинг вправі (додатковий функціонал).
 * @param {string} exerciseId
 * @param {{rate: number, email: string, review: string}} payload
 */
export async function addExerciseRating(exerciseId, payload) {
  const { data } = await api.patch(`/exercises/${exerciseId}/rating`, payload);
  return data;
}

/**
 * Цитата дня.
 * @returns {Promise<{_id: string, author: string, quote: string}>}
 */
export async function getQuote() {
  const { data } = await api.get('/quote');
  return data;
}

/**
 * Підписка на розсилку.
 * @param {string} email
 */
export async function subscribe(email) {
  const { data } = await api.post('/subscription', { email });
  return data;
}
