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
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox?.querySelector(".lightbox-image");
const lightboxError = lightbox?.querySelector(".lightbox-error");
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
document.querySelectorAll(".gallery-card").forEach((button) => {
  button.addEventListener("click", async () => {
    if (!lightbox || lightbox.open) return;
    const request = ++photoRequest;
    lastGalleryButton = button;
    const thumbnail = button.querySelector("img");
    photoRatio = Number(button.dataset.width) / Number(button.dataset.height);
    if (!Number.isFinite(photoRatio) || photoRatio <= 0) photoRatio = 1;
    sizeLightboxPhoto();
    lightboxError.hidden = true;
    lightboxImage.hidden = false;
    lightboxImage.alt = thumbnail.alt;
    lightboxImage.src = thumbnail.currentSrc || thumbnail.src;
    lightbox.setAttribute("aria-busy", "true");
    lightbox.showModal();
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
  });
});
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
// The close button is the only interactive element in this dialog.
lightbox?.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    lightbox.querySelector(".lightbox-close").focus();
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
      "Ďakujem! Správa bola odoslaná. Ozvem sa ti čo najskôr.";
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
