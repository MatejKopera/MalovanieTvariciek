const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Otvoriť navigáciu' : 'Zavrieť navigáciu');
  navigation.classList.toggle('is-open', !open);
  document.body.classList.toggle('menu-open', !open);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Otvoriť navigáciu');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  });
});

document.querySelectorAll('[data-delay]').forEach((element) => {
  element.style.setProperty('--delay', `${element.dataset.delay}ms`);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const lightbox = document.querySelector('#lightbox');
const lightboxTitle = document.querySelector('#lightbox-title');
const lightboxCard = document.querySelector('.lightbox-card');
const lightboxImage = document.querySelector('#lightbox-image');
const closeButton = document.querySelector('.lightbox-close');
let lastGalleryButton = null;

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  lastGalleryButton?.focus();
}

document.querySelectorAll('.gallery-card').forEach((button) => {
  button.addEventListener('click', () => {
    lastGalleryButton = button;
    lightboxTitle.textContent = button.dataset.photo;
    const imagePath = button.dataset.image;
    lightboxCard.classList.toggle('has-image', Boolean(imagePath));
    lightboxImage.src = imagePath || '';
    lightboxImage.alt = imagePath ? `Zväčšená fotografia: ${button.dataset.photo}` : '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    closeButton.focus();
  });
});

closeButton?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
});

const bookingForm = document.querySelector('#booking-form');
const toast = document.querySelector('#toast');
const toastIcon = document.querySelector('#toast-icon');
const toastTitle = document.querySelector('#toast-title');
const toastMessage = document.querySelector('#toast-message');
let toastTimer;

function showToast({ error = false, title, message }) {
  if (!toast) return;
  toast.classList.toggle('is-error', error);
  toastIcon.textContent = error ? '!' : '✓';
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 7000);
}

bookingForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!bookingForm.reportValidity()) {
    return;
  }

  const submitButton = bookingForm.querySelector('.button-submit');
  const buttonLabel = submitButton?.querySelector('.button-label');
  if (submitButton) submitButton.disabled = true;
  if (buttonLabel) buttonLabel.textContent = 'Odosielam…';

  try {
    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch('https://formsubmit.co/ajax/beatka.juritkova@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false || result.success === 'false') {
      throw new Error('FormSubmit request failed');
    }

    bookingForm.reset();
    showToast({
      title: 'Správa bola odoslaná',
      message: 'Ďakujem za tvoj dopyt. Ozvem sa ti čo najskôr.',
    });
  } catch (error) {
    showToast({
      error: true,
      title: 'Správu sa nepodarilo odoslať',
      message: 'Skús to, prosím, znova alebo mi napíš priamo na e-mail.',
    });
  } finally {
    if (submitButton) submitButton.disabled = false;
    if (buttonLabel) buttonLabel.textContent = 'Chcem nezáväznú ponuku';
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();
