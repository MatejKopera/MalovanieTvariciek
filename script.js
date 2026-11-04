const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
function closeMenu() {
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Otvoriť navigáciu");
  navigation?.classList.remove("is-open");
}
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Zavrieť navigáciu" : "Otvoriť navigáciu",
  );
  navigation?.classList.toggle("is-open", open);
});
navigation
  ?.querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton?.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia("(min-width: 1100px)").addEventListener("change", closeMenu);

// Follow local section links only; gallery and privacy pages keep their page links.
const navigationSections = Array.from(
  navigation?.querySelectorAll('a[href^="#"]') ?? [],
).map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
  .filter(({ section }) => section);
if (navigationSections.length) {
  const header = document.querySelector(".site-header");
  let scrollUpdatePending = false;
  function updateCurrentSection() {
    const boundary = header.getBoundingClientRect().bottom + 32;
    let current = navigationSections[0];
    navigationSections.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= boundary) current = item;
    });
    // The last section may be too short to reach the top of a tall screen.
    if (window.scrollY > 0 &&
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      current = navigationSections[navigationSections.length - 1];
    }
    navigationSections.forEach(({ link }) => {
      if (link === current.link) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scrollUpdatePending = false;
  }
  function scheduleSectionUpdate() {
    if (scrollUpdatePending) return;
    scrollUpdatePending = true;
    window.requestAnimationFrame(updateCurrentSection);
  }
  window.addEventListener("scroll", scheduleSectionUpdate, { passive: true });
  window.addEventListener("resize", scheduleSectionUpdate);
  window.addEventListener("pageshow", scheduleSectionUpdate);
  updateCurrentSection();
}

const priceCards = document.querySelectorAll(".price-card");
if (priceCards.length && "IntersectionObserver" in window) {
  const priceObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add("is-visible");
      priceObserver.unobserve(target);
    });
  }, { threshold: 0.15 });
  priceCards.forEach((card) => priceObserver.observe(card));
}

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox?.querySelector(".lightbox-image");
const lightboxError = lightbox?.querySelector(".lightbox-error");
const galleryButtons = Array.from(document.querySelectorAll(".gallery-card"));
let currentPhoto = 0;
let lastGalleryButton;
let photoRequest = 0;
let photoRatio = 1;
function sizeLightboxPhoto() {
  if (!lightboxImage) return;
  const cssLimit = Number.parseFloat(
    window.getComputedStyle?.(lightbox)?.maxWidth,
  );
  const width = Math.min(
    window.innerWidth - 48,
    (window.innerHeight - 112) * photoRatio,
    Number.isFinite(cssLimit) ? cssLimit : Infinity,
  );
  lightboxImage.style.width = `${Math.max(1, width)}px`;
  lightboxImage.style.height = `${Math.max(1, width / photoRatio)}px`;
}
window.addEventListener?.("resize", () => {
  if (lightbox?.open) sizeLightboxPhoto();
});
async function showLightboxPhoto(button) {
  if (!lightbox) return;
  const request = ++photoRequest;
  const thumbnail = button.querySelector("img");
  photoRatio = Number(button.dataset.width) / Number(button.dataset.height);
  if (!Number.isFinite(photoRatio) || photoRatio <= 0) photoRatio = 1;
  sizeLightboxPhoto();
  lightboxError.hidden = true;
  lightboxImage.hidden = false;
  lightboxImage.alt = thumbnail.alt;
  lightboxImage.src = thumbnail.currentSrc || thumbnail.src;
  lightbox.setAttribute("aria-busy", "true");
  if (!lightbox.open) lightbox.showModal();
  document.body.classList.add("modal-open");
  try {
    const full = new Image();
    full.src = button.dataset.image;
    await full.decode();
    if (request !== photoRequest || !lightbox.open) return;
    lightboxImage.src = full.src;
  } catch {
    if (request !== photoRequest || !lightbox.open) return;
    lightboxError.hidden = false;
  } finally {
    if (request === photoRequest) lightbox.removeAttribute("aria-busy");
  }
}
galleryButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    if (!lightbox || lightbox.open) return;
    lastGalleryButton = button;
    currentPhoto = index;
    return showLightboxPhoto(button);
  });
});
function moveLightboxPhoto(direction) {
  if (!lightbox?.open || galleryButtons.length < 2) return;
  currentPhoto =
    (currentPhoto + direction + galleryButtons.length) % galleryButtons.length;
  return showLightboxPhoto(galleryButtons[currentPhoto]);
}
lightbox
  ?.querySelector(".lightbox-previous")
  ?.addEventListener("click", () => moveLightboxPhoto(-1));
lightbox
  ?.querySelector(".lightbox-next")
  ?.addEventListener("click", () => moveLightboxPhoto(1));
lightboxImage?.addEventListener("error", () => {
  lightboxImage.hidden = true;
  lightboxError.hidden = false;
});
lightbox
  ?.querySelector(".lightbox-close")
  .addEventListener("click", () => lightbox.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target !== lightbox) return;
  const rect = lightbox.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    lightbox.close();
});
lightbox?.addEventListener("close", () => {
  photoRequest++;
  lightbox.removeAttribute("aria-busy");
  document.body.classList.remove("modal-open");
  lastGalleryButton?.focus({ preventScroll: true });
});
lightbox?.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    return moveLightboxPhoto(event.key === "ArrowLeft" ? -1 : 1);
  }
  if (event.key === "Tab") {
    const controls = Array.from(lightbox.querySelectorAll("button"));
    const current = controls.indexOf(document.activeElement);
    const next =
      current < 0
        ? 0
        : (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
    event.preventDefault();
    controls[next].focus();
  }
});
const bookingForm = document.querySelector("#booking-form");
const formStatus = document.querySelector("#form-status");
let sending = false;
bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (sending || !bookingForm.reportValidity()) return;
  if (bookingForm.elements.namedItem("_honey").value) return;
  sending = true;
  const submitButton = bookingForm.querySelector(".button-submit");
  const label = submitButton.querySelector(".button-label");
  submitButton.disabled = true;
  label.textContent = "Odosielam…";
  bookingForm.setAttribute("aria-busy", "true");
  formStatus.hidden = true;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  let needsActivation = false;
  try {
    const response = await fetch(
      "https://formsubmit.co/ajax/beatka.juritkova@gmail.com",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(Object.fromEntries(new FormData(bookingForm))),
        signal: controller.signal,
      },
    );
    const result = await response.json();
    needsActivation = /activat/i.test(String(result.message || ""));
    if (!response.ok || (result.success !== true && result.success !== "true"))
      throw new Error("Submission rejected");
    bookingForm.reset();
    bookingForm.querySelectorAll('input[type="date"]').forEach((input) => {
      input.dataset.filled = "false";
    });
    formStatus.classList.remove("is-error");
    formStatus.textContent =
      "Ďakujem! Správa bola odoslaná. Ozvem sa vám čo najskôr.";
  } catch {
    formStatus.classList.add("is-error");
    formStatus.textContent = needsActivation
      ? "Odosielanie formulára ešte nie je aktivované. Vaša správa nebola odoslaná a údaje zostali vyplnené. Napíšte mi na beatka.juritkova@gmail.com alebo zavolajte na +421 951 192 229."
      : controller.signal.aborted
      ? "Potvrdenie odoslania trvá príliš dlho. Správa už mohla byť prijatá, preto ju neposielajte hneď znova. Údaje zostali vyplnené. Kontaktujte ma na beatka.juritkova@gmail.com."
      : "Správu sa nepodarilo odoslať. Údaje zostali vyplnené. Skúste to znova alebo mi napíšte na beatka.juritkova@gmail.com.";
  } finally {
    clearTimeout(timeout);
    sending = false;
    submitButton.disabled = false;
    label.textContent = "Odoslať";
    bookingForm.removeAttribute("aria-busy");
    formStatus.hidden = false;
  }
});
document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});
document.querySelectorAll('input[type="date"]').forEach((input) => {
  const update = () => {
    input.dataset.filled = String(Boolean(input.value));
  };
  input.addEventListener("input", update);
  input.addEventListener("change", update);
  update();
});
