/**
 * Form Handler — Contactformulier met reCAPTCHA v3
 *
 * Verwerkt formulier client-side:
 * 1. Validatie
 * 2. reCAPTCHA v3 token ophalen
 * 3. Versturen naar Cloudflare Pages Function
 * 4. Feedback tonen
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", handleSubmit);
});

async function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector(".form__submit");
  const submitText = form.querySelector(".form__submit-text");
  const submitLoading = form.querySelector(".form__submit-loading");
  const feedback = document.getElementById("formFeedback");

  // Reset feedback
  feedback.hidden = true;
  feedback.className = "form__feedback";
  clearErrors(form);

  // Client-side validatie
  if (!validateForm(form)) return;

  // UI: loading state
  submitBtn.disabled = true;
  submitText.hidden = true;
  submitLoading.hidden = false;

  try {
    // reCAPTCHA v3 token ophalen
    const siteKey = document.querySelector('input[name="recaptcha_token"]')
      ?.closest("form")
      ?.dataset?.recaptchaKey;

    if (typeof grecaptcha !== "undefined") {
      // Haal de site key op uit de reCAPTCHA script URL
      const recaptchaScript = document.querySelector('script[src*="recaptcha"]');
      const key = recaptchaScript?.src?.match(/render=([^&]+)/)?.[1];

      if (key) {
        const token = await grecaptcha.execute(key, { action: "contact" });
        document.getElementById("recaptchaToken").value = token;
      }
    }

    // Verstuur formulier
    const formData = new FormData(form);
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      // Succes
      feedback.textContent = result.message || "Bedankt! Uw bericht is verstuurd.";
      feedback.className = "form__feedback form__feedback--success";
      feedback.hidden = false;
      form.reset();
    } else {
      // Server error
      feedback.textContent = result.error || "Er ging iets mis. Probeer het opnieuw.";
      feedback.className = "form__feedback form__feedback--error";
      feedback.hidden = false;
    }
  } catch (err) {
    feedback.textContent = "Er ging iets mis met de verbinding. Probeer het later opnieuw.";
    feedback.className = "form__feedback form__feedback--error";
    feedback.hidden = false;
  } finally {
    // UI: reset loading state
    submitBtn.disabled = false;
    submitText.hidden = false;
    submitLoading.hidden = true;
  }
}

/**
 * Client-side validatie
 */
function validateForm(form) {
  let isValid = true;

  const name = form.querySelector("#name");
  const email = form.querySelector("#email");
  const message = form.querySelector("#message");

  if (!name.value.trim()) {
    showError(name, "Vul uw naam in.");
    isValid = false;
  }

  if (!email.value.trim()) {
    showError(email, "Vul uw e-mailadres in.");
    isValid = false;
  } else if (!isValidEmail(email.value)) {
    showError(email, "Vul een geldig e-mailadres in.");
    isValid = false;
  }

  if (!message.value.trim()) {
    showError(message, "Vul een bericht in.");
    isValid = false;
  }

  return isValid;
}

function showError(input, message) {
  input.classList.add("is-invalid");
  const errorEl = input.parentElement.querySelector(".form__error");
  if (errorEl) errorEl.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  form.querySelectorAll(".form__error").forEach((el) => (el.textContent = ""));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
