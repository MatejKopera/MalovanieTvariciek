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
let toastTimer;

bookingForm?.addEventListener('submit', (event) => {
  if (!bookingForm.reportValidity()) {
    event.preventDefault();
    return;
  }

  const submitButton = bookingForm.querySelector('.button-submit');
  const buttonLabel = submitButton?.querySelector('.button-label');
  if (submitButton) submitButton.disabled = true;
  if (buttonLabel) buttonLabel.textContent = 'Odosielam…';
});

const pageUrl = new URL(window.location.href);
if (pageUrl.searchParams.get('odoslane') === '1') {
  toast?.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast?.classList.remove('is-visible'), 6500);
  pageUrl.searchParams.delete('odoslane');
  window.history.replaceState({}, '', `${pageUrl.pathname}${pageUrl.search}${pageUrl.hash}`);
}

document.querySelector('#year').textContent = new Date().getFullYear();
