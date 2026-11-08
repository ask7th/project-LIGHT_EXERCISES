const API_BASE = 'https://your-energy.b.goit.study/api';

const FILTER_PARAMS = {
  Muscles: 'muscles',
  'Body parts': 'bodypart',
  Equipment: 'equipment',
};

export function getFilterParam(filter) {
  return FILTER_PARAMS[filter] || '';
}

export async function fetchExercises({
  filter,
  category,
  keyword = '',
  page = 1,
  limit = 8,
}) {
  const paramName = getFilterParam(filter);

  if (!paramName || !category) {
    throw new Error('Filter and category are required.');
  }

  const params = new URLSearchParams({
    [paramName]: category,
    page: String(page),
    limit: String(limit),
  });

  const normalizedKeyword = keyword.trim();
  if (normalizedKeyword) {
    params.set('keyword', normalizedKeyword);
  }

  const response = await fetch(`${API_BASE}/exercises?${params}`);

  if (!response.ok) {
    throw new Error(`Exercises request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchExerciseById(id) {
  const response = await fetch(`${API_BASE}/exercises/${id}`);

  if (!response.ok) {
    throw new Error(`Exercise request failed: ${response.status}`);
  }

  return response.json();
}
