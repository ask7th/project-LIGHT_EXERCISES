const API_URL = 'https://your-energy.b.goit.study/api/exercises/';
const FAVORITES_KEY = 'energy-favorites';

function getExerciseId(exercise) {
  return exercise._id || exercise.id || '';
}

function getFavorites() {
  try {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);

    if (!savedFavorites) {
      return [];
    }

    const favorites = JSON.parse(savedFavorites);
    return Array.isArray(favorites) ? favorites : [];
  } catch {
    return [];
  }
}

function setText(element, value, defaultText = '—') {
  if (value === undefined || value === null || value === '') {
    element.textContent = defaultText;
    return;
  }

  element.textContent = value;
}

async function getExercise(exerciseOrId) {
  if (typeof exerciseOrId === 'object' && exerciseOrId !== null) {
    return exerciseOrId;
  }

  if (!exerciseOrId) {
    throw new Error('Exercise ID is missing.');
  }

  const response = await fetch(`${API_URL}${encodeURIComponent(exerciseOrId)}`);

  if (!response.ok) {
    throw new Error('Could not load exercise details. Please try again.');
  }

  const data = await response.json();
  return data.exercise || data;
}

export function initExerciseModal() {
  const modal = document.querySelector('.exercise-modal');

  if (!modal) {
    return;
  }

  const closeButton = modal.querySelector('.exercise-modal-close');
  const favoriteButton = modal.querySelector('.exercise-modal-favorite');
  const favoriteLabel = modal.querySelector('.exercise-modal-favorite-label');
  const favoriteIcon = modal.querySelector('[data-favorite-icon]');
  const image = modal.querySelector('.exercise-modal-media');
  const imagePlaceholder = modal.querySelector(
    '.exercise-modal-media-placeholder'
  );
  const errorMessage = modal.querySelector('.exercise-modal-error');
  const currentExerciseTitle = modal.querySelector('.exercise-modal-title');
  const ratingValue = modal.querySelector('.exercise-modal-rating-value');
  const stars = modal.querySelector('.exercise-modal-stars');
  const description = modal.querySelector('.exercise-modal-description');
  const target = modal.querySelector('[data-field="target"]');
  const bodyPart = modal.querySelector('[data-field="bodyPart"]');
  const popularity = modal.querySelector('[data-field="popularity"]');
  const burnedCalories = modal.querySelector('[data-field="burnedCalories"]');

  let currentExercise = null;

  function showFavoriteButton(exercise) {
    const exerciseId = getExerciseId(exercise);
    const favorites = getFavorites();
    const isFavorite = favorites.some(
      item => getExerciseId(item) === exerciseId
    );

    favoriteLabel.textContent = isFavorite
      ? 'Remove from favorites'
      : 'Add to favorites';
    favoriteIcon.setAttribute(
      'href',
      `./sprite.svg#icon-${isFavorite ? 'trash' : 'heart'}`
    );
    favoriteButton.classList.toggle('is-favorite', isFavorite);
    favoriteButton.setAttribute('aria-pressed', String(isFavorite));
  }

  function showImage(exercise) {
    const imageUrl = exercise.gifUrl || exercise.videoUrl || exercise.video;

    if (!imageUrl) {
      image.removeAttribute('src');
      image.hidden = true;
      imagePlaceholder.textContent = 'Exercise preview unavailable';
      imagePlaceholder.hidden = false;
      return;
    }

    image.src = imageUrl;
    image.alt = `${exercise.name || 'Exercise'} demonstration`;
    image.hidden = false;
    imagePlaceholder.hidden = true;
  }

  function showExercise(exercise) {
    modal.dataset.exerciseId = getExerciseId(exercise);
    setText(currentExerciseTitle, exercise.name, 'Exercise');
    setText(ratingValue, Number(exercise.rating || 0).toFixed(1));
    setText(target, exercise.target);
    setText(bodyPart, exercise.bodyPart);
    setText(popularity, exercise.popularity);
    setText(burnedCalories, exercise.burnedCalories);
    setText(description, exercise.description, 'No description available.');

    const rating = Math.max(0, Math.min(5, Number(exercise.rating || 0)));
    stars.style.setProperty('--rating', `${(rating / 5) * 100}%`);

    showImage(exercise);
    showFavoriteButton(exercise);
  }

  async function openModal(exerciseOrId) {
    currentExercise = null;
    errorMessage.hidden = true;
    image.hidden = true;
    imagePlaceholder.textContent = 'Loading exercise…';
    imagePlaceholder.hidden = false;

    if (!modal.open) {
      modal.showModal();
    }

    try {
      currentExercise = await getExercise(exerciseOrId);
      showExercise(currentExercise);
    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.hidden = false;
      imagePlaceholder.textContent = 'Exercise preview unavailable';
    }
  }

  function changeFavorite() {
    if (!currentExercise) {
      return;
    }

    const exerciseId = getExerciseId(currentExercise);

    if (!exerciseId) {
      return;
    }

    const favorites = getFavorites();
    const isFavorite = favorites.some(
      item => getExerciseId(item) === exerciseId
    );
    const updatedFavorites = isFavorite
      ? favorites.filter(item => getExerciseId(item) !== exerciseId)
      : [...favorites, currentExercise];

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    showFavoriteButton(currentExercise);
    document.dispatchEvent(
      new CustomEvent('favorites:change', {
        detail: { favorites: updatedFavorites },
      })
    );
    document.dispatchEvent(
      new CustomEvent('favorites:changed', { detail: updatedFavorites })
    );
  }

  closeButton.addEventListener('click', () => modal.close());
  favoriteButton.addEventListener('click', changeFavorite);

  image.addEventListener('error', () => {
    image.hidden = true;
    imagePlaceholder.textContent = 'Exercise preview unavailable';
    imagePlaceholder.hidden = false;
  });

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      modal.close();
    }
  });

  document.addEventListener('click', event => {
    const trigger = event.target.closest(
      '[data-exercise-start], button.exercise-card-start, button[data-exercise-id]'
    );

    if (!trigger) {
      return;
    }

    const exerciseId =
      trigger.dataset.exerciseId ||
      trigger.closest('[data-exercise-id]')?.dataset.exerciseId;
    const exerciseData =
      trigger.exercise || trigger.closest('[data-exercise-card]')?.exercise;

    if (exerciseData || exerciseId) {
      openModal(exerciseData || exerciseId);
    }
  });

  document.addEventListener('exercise:open-modal', event => {
    openModal(event.detail);
  });

  document.addEventListener('exercise:open', event => {
    const exerciseId = event.detail?.id || event.detail;
    if (!exerciseId) return;

    event.preventDefault();
    openModal(exerciseId);
  });
}
