import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
const source = await readFile(new URL("../script.js", import.meta.url), "utf8");
function setup() {
  const events = {},
    requests = [],
    classes = new Set(),
    resize = {};
  let focus;
  const image = { style: {}, hidden: false, addEventListener() {} };
  const error = { hidden: true };
  const close = {
    focus() {
      focus = "close";
    },
    addEventListener(type, fn) {
      events["button:" + type] = fn;
    },
  };
  const dialog = {
    open: false,
    attrs: {},
    querySelector: (s) =>
      s === ".lightbox-image" ? image : s === ".lightbox-error" ? error : close,
    setAttribute(k, v) {
      this.attrs[k] = v;
    },
    removeAttribute(k) {
      delete this.attrs[k];
    },
    addEventListener(type, fn) {
      events[type] = fn;
    },
    showModal() {
      this.open = true;
      focus = "close";
    },
    close() {
      this.open = false;
      events.close();
    },
    getBoundingClientRect: () => ({
      left: 100,
      right: 300,
      top: 100,
      bottom: 500,
    }),
  };
  const buttons = ["first", "second"].map((id) => ({
    dataset: { image: id + ".webp", width: "600", height: "900" },
    querySelector: () => ({
      alt: id,
      src: id + "-thumb.webp",
      currentSrc: id + "-thumb.webp",
    }),
    addEventListener(type, fn) {
      this[type] = fn;
    },
    focus() {
      focus = id;
    },
  }));
  const window = {
    innerWidth: 390,
    innerHeight: 844,
    matchMedia: () => ({ addEventListener() {} }),
    addEventListener(type, fn) {
      resize[type] = fn;
    },
  };
  vm.runInNewContext(source, {
    document: {
      querySelector: (s) => (s === ".lightbox" ? dialog : null),
      querySelectorAll: (s) => (s === ".gallery-card" ? buttons : []),
      addEventListener() {},
      body: {
        classList: {
          add: (x) => classes.add(x),
          remove: (x) => classes.delete(x),
        },
      },
    },
    window,
    Image: class {
      decode() {
        return new Promise((resolve, reject) =>
          requests.push({ resolve, reject, image: this }),
        );
      }
    },
  });
  return {
    dialog,
    image,
    error,
    buttons,
    requests,
    events,
    classes,
    window,
    resize,
    get focus() {
      return focus;
    },
  };
}
test("opening reserves the natural aspect and waits for decoding before showing full image", async () => {
  const s = setup();
  const pending = s.buttons[0].click();
  assert.equal(s.dialog.open, true);
  assert.equal(s.dialog.attrs["aria-busy"], "true");
  assert.equal(s.image.src, "first-thumb.webp");
  assert.ok(
    Math.abs(
      parseFloat(s.image.style.width) / parseFloat(s.image.style.height) -
        2 / 3,
    ) < 0.001,
  );
  const size = { ...s.image.style };
  s.requests[0].resolve();
  await pending;
  assert.equal(s.image.src, "first.webp");
  assert.deepEqual(s.image.style, size);
  assert.equal(s.dialog.attrs["aria-busy"], undefined);
});
test("closing during a slow download and opening another photo cannot display the old photo", async () => {
  const s = setup();
  const old = s.buttons[0].click();
  s.dialog.close();
  assert.equal(s.focus, "first");
  const current = s.buttons[1].click();
  s.requests[0].resolve();
  await old;
  assert.equal(s.image.src, "second-thumb.webp");
  assert.equal(s.dialog.attrs["aria-busy"], "true");
  s.requests[1].resolve();
  await current;
  assert.equal(s.image.src, "second.webp");
});
test("failed large-image download preserves the thumbnail and offers an error", async () => {
  const s = setup();
  const pending = s.buttons[0].click();
  s.requests[0].reject(new Error("offline"));
  await pending;
  assert.equal(s.image.src, "first-thumb.webp");
  assert.equal(s.error.hidden, false);
  assert.equal(s.dialog.attrs["aria-busy"], undefined);
});
test("resize fits both viewport dimensions without changing aspect", () => {
  const s = setup();
  s.buttons[0].click();
  s.window.innerWidth = 844;
  s.window.innerHeight = 390;
  s.resize.resize();
  assert.ok(parseFloat(s.image.style.height) <= 278);
  assert.ok(parseFloat(s.image.style.width) <= 796);
  assert.ok(
    Math.abs(
      parseFloat(s.image.style.width) / parseFloat(s.image.style.height) -
        2 / 3,
    ) < 0.001,
  );
});
test("CSS viewport limit is applied to both dimensions, including a reserved scrollbar gutter", () => {
  const s = setup();
  s.window.getComputedStyle = () => ({ maxWidth: "300px" });
  s.buttons[0].click();
  assert.equal(parseFloat(s.image.style.width), 300);
  assert.equal(parseFloat(s.image.style.height), 450);
});
test("backdrop closes, image clicks do not, Tab remains in dialog, and focus returns", () => {
  const s = setup();
  s.buttons[0].click();
  s.events.click({ target: s.image });
  assert.equal(s.dialog.open, true);
  s.events.click({ target: s.dialog, clientX: 150, clientY: 150 });
  assert.equal(s.dialog.open, true);
  let prevented = false;
  s.events.keydown({
    key: "Tab",
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
  assert.equal(s.focus, "close");
  s.events.click({ target: s.dialog, clientX: 30, clientY: 30 });
  assert.equal(s.dialog.open, false);
  assert.equal(s.focus, "first");
  assert.equal(s.classes.has("modal-open"), false);
});
