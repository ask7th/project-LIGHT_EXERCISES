import axios from 'axios';
import { EXERCISE_MODAL, EMAIL_PATTERN } from './constants.js';

function getExerciseId(exercise) {
  return exercise._id || exercise.id || '';
}

function getFavorites() {
  try {
    const savedFavorites = localStorage.getItem(EXERCISE_MODAL.FAVORITES_KEY);

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

  const { data } = await axios.get(
    `${EXERCISE_MODAL.API_URL}${encodeURIComponent(exerciseOrId)}`
  );
  return data.exercise || data;
}

export function initExerciseModal() {
  const modal = document.querySelector('.exercise-modal');

  if (!modal) {
    return;
  }

  const backdrop = modal.closest('.exercise-modal-backdrop');
  if (!backdrop) return;

  const closeButton = document.querySelector('.exercise-modal-close');
  const exerciseView = document.querySelector('.exercise-modal-content');
  const ratingView = document.querySelector('.exercise-modal-rating-view');
  const ratingForm = document.querySelector('.rating-form');
  const ratingFormError = document.querySelector('.rating-form-error');
  const ratingFormValue = document.querySelector('.rating-form-value');
  const ratingStars = document.querySelector('.rating-form-stars');
  const ratingEmail = document.querySelector('#rating-email');
  const favoriteButton = document.querySelector('.exercise-modal-favorite');
  const ratingButton = document.querySelector('.exercise-modal-rate');
  const favoriteLabel = document.querySelector('.exercise-modal-favorite-label');
  const favoriteIcon = document.querySelector('[data-favorite-icon]');
  const image = document.querySelector('.exercise-modal-media');
  const imagePlaceholder = document.querySelector(
    '.exercise-modal-media-placeholder'
  );
  const errorMessage = document.querySelector('.exercise-modal-error');
  const currentExerciseTitle = document.querySelector('.exercise-modal-title');
  const ratingValue = document.querySelector('.exercise-modal-rating-value');
  const stars = document.querySelector('.exercise-modal-stars');
  const description = document.querySelector('.exercise-modal-description');
  const target = document.querySelector('[data-field="target"]');
  const bodyPart = document.querySelector('[data-field="bodyPart"]');
  const equipment = document.querySelector('[data-field="equipment"]');
  const popularity = document.querySelector('[data-field="popularity"]');
  const burnedCalories = document.querySelector('[data-field="burnedCalories"]');

  let currentExercise = null;
  let isRatingViewOpen = false;
  let lastFocusedElement = null;
  let openRequestId = 0;

  function showExerciseView() {
    isRatingViewOpen = false;
    exerciseView.hidden = false;
    ratingView.hidden = true;
    modal.classList.remove('is-rating-view');
    modal.setAttribute('aria-labelledby', 'exercise-modal-title');
    closeButton.setAttribute('aria-label', 'Close exercise details');
  }

  function showRatingView() {
    if (!currentExercise) return;

    isRatingViewOpen = true;
    exerciseView.hidden = true;
    ratingView.hidden = false;
    modal.classList.add('is-rating-view');
    modal.setAttribute('aria-labelledby', 'rating-modal-title');
    ratingForm.reset();
    ratingFormValue.value = '0.0';
    ratingStars.style.removeProperty('--selected-rating');
    ratingFormError.hidden = true;
    closeButton.setAttribute('aria-label', 'Back to exercise details');
  }

  function closeOrReturnToExercise() {
    if (isRatingViewOpen) {
      showExerciseView();
      return;
    }

    closeModal();
  }

  function closeModal() {
    backdrop.hidden = true;
    document.body.classList.remove('exercise-modal-open');
    lastFocusedElement?.focus();
  }

  function getExerciseFromEvent(event) {
    const detail = event.detail;

    if (detail && typeof detail === 'object') {
      return detail.exercise || detail.exerciseId || detail.id || detail;
    }

    return detail;
  }

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
      `${window.__SPRITE_URL__}#icon-${isFavorite ? 'trash' : 'heart'}`
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
    modal.classList.remove('is-loading');
    modal.dataset.exerciseId = getExerciseId(exercise);
    setText(currentExerciseTitle, exercise.name, 'Exercise');
    setText(ratingValue, Number(exercise.rating || 0).toFixed(1));
    setText(target, exercise.target);
    setText(bodyPart, exercise.bodyPart);
    setText(equipment, exercise.equipment);
    setText(popularity, exercise.popularity);
    setText(burnedCalories, exercise.burnedCalories);
    setText(description, exercise.description, 'No description available.');

    const rating = Math.max(0, Math.min(5, Number(exercise.rating || 0)));
    stars.style.setProperty('--rating', `${(rating / 5) * 100}%`);

    showImage(exercise);
    showFavoriteButton(exercise);
  }

  async function openModal(exerciseOrId) {
    const requestId = ++openRequestId;

    currentExercise = null;
    showExerciseView();
    modal.classList.add('is-loading');
    errorMessage.hidden = true;
    setText(currentExerciseTitle, 'Loading exercise…');
    setText(ratingValue, '—');
    setText(target, '—');
    setText(bodyPart, '—');
    setText(equipment, '—');
    setText(popularity, '—');
    setText(burnedCalories, '—');
    setText(description, 'Loading exercise…');
    stars.style.setProperty('--rating', '0%');
    image.hidden = true;
    imagePlaceholder.textContent = 'Loading exercise…';
    imagePlaceholder.hidden = false;

    if (backdrop.hidden) {
      lastFocusedElement = document.activeElement;
      backdrop.hidden = false;
      document.body.classList.add('exercise-modal-open');
    }
    modal.focus({ preventScroll: true });

    try {
      const exercise = await getExercise(exerciseOrId);
      if (requestId !== openRequestId) return;

      currentExercise = exercise;
      showExercise(currentExercise);
    } catch (error) {
      if (requestId !== openRequestId) return;

      modal.classList.remove('is-loading');
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

    try {
      localStorage.setItem(
        EXERCISE_MODAL.FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );
    } catch (error) {
      console.error('Could not save favorites:', error);
      errorMessage.textContent = 'Could not save favorite. Please try again.';
      errorMessage.hidden = false;
      return;
    }

    showFavoriteButton(currentExercise);
    document.dispatchEvent(
      new CustomEvent(EXERCISE_MODAL.FAVORITES_CHANGED_EVENT, {
        detail: updatedFavorites,
      })
    );
  }

  closeButton.addEventListener('click', closeOrReturnToExercise);
  favoriteButton.addEventListener('click', changeFavorite);
  ratingButton?.addEventListener('click', () => {
    showRatingView();
  });

  document.querySelectorAll('.rating-form input[name="rate"]').forEach(input => {
    input.addEventListener('change', () => {
      ratingFormValue.value = Number(input.value).toFixed(1);
      ratingStars.style.setProperty('--selected-rating', input.value);
    });
  });

  ratingForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!ratingForm.reportValidity()) return;

    const formData = new FormData(ratingForm);
    const rate = Number(formData.get('rate'));
    const email = String(formData.get('email')).trim();
    const review = String(formData.get('review')).trim();
    const exerciseId = getExerciseId(currentExercise || {});

    if (!EMAIL_PATTERN.test(email) || !review || !rate || !exerciseId) {
      ratingFormError.textContent = 'Please complete all fields with valid values.';
      ratingFormError.hidden = false;
      return;
    }

    const submitButton = document.querySelector('.rating-form [type="submit"]');
    submitButton.disabled = true;
    ratingFormError.hidden = true;

    try {
      const { data } = await axios.patch(
        `${EXERCISE_MODAL.API_URL}${encodeURIComponent(exerciseId)}/rating`,
        { rate, email, review }
      );

      const updatedRating = data?.rating ?? data?.exercise?.rating;
      if (Number.isFinite(Number(updatedRating))) {
        currentExercise.rating = Number(updatedRating);
        setText(ratingValue, currentExercise.rating.toFixed(1));
        stars.style.setProperty('--rating', `${(currentExercise.rating / 5) * 100}%`);
      }

      showExerciseView();
    } catch (error) {
      ratingFormError.textContent =
        error.response?.data?.message || 'Could not send your rating. Please try again.';
      ratingFormError.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  });

  image.addEventListener('error', () => {
    image.hidden = true;
    imagePlaceholder.textContent = 'Exercise preview unavailable';
    imagePlaceholder.hidden = false;
  });

  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) {
      closeOrReturnToExercise();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !backdrop.hidden) {
      event.preventDefault();
      closeOrReturnToExercise();
    }
  });

  document.addEventListener('exercise:open', event => {
    const exercise = getExerciseFromEvent(event);
    if (!exercise) return;

    event.preventDefault();
    openModal(exercise);
  });
}
