const SUBSCRIPTION_URL = 'https://your-energy.b.goit.study/api/subscription';
const FALLBACK_ERROR_MESSAGE = 'Unable to subscribe. Please try again.';
const FALLBACK_SUCCESS_MESSAGE = 'Subscription successfully created';

export function initSubscriptionForm() {
  const form = document.querySelector('.footer-form');

  if (!form) {
    return;
  }

  const emailInput = form.elements.email;
  const message = form.querySelector('.footer-message');
  const submitButton = form.querySelector('.footer-button');

  emailInput.addEventListener('input', () => {
    setMessage(message, '');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    emailInput.value = emailInput.value.trim();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitButton.disabled = true;

    try {
      const response = await fetch(SUBSCRIPTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailInput.value }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(message, data.message || FALLBACK_ERROR_MESSAGE, true);
        return;
      }

      setMessage(message, data.message || FALLBACK_SUCCESS_MESSAGE);
      form.reset();
    } catch {
      setMessage(message, FALLBACK_ERROR_MESSAGE, true);
    } finally {
      submitButton.disabled = false;
    }
  });
}

function setMessage(messageElement, text, isError = false) {
  messageElement.textContent = text;
  messageElement.classList.toggle('is-error', Boolean(text) && isError);
}
