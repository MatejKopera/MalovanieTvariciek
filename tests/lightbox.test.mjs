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
  let focus, activeElement;
  const image = { style: {}, hidden: false, addEventListener() {} };
  const error = { hidden: true };
  const close = {
    focus() {
      focus = "close";
      activeElement = close;
    },
    addEventListener(type, fn) {
      events["button:" + type] = fn;
    },
  };
  const previous = {
    focus() { focus = "previous"; activeElement = previous; },
    addEventListener(type, fn) { events["previous:" + type] = fn; },
  };
  const next = {
    focus() { focus = "next"; activeElement = next; },
    addEventListener(type, fn) { events["next:" + type] = fn; },
  };
  const dialog = {
    open: false,
    attrs: {},
    querySelector: (s) =>
      ({ ".lightbox-image": image, ".lightbox-error": error,
        ".lightbox-close": close, ".lightbox-previous": previous, ".lightbox-next": next })[s],
    querySelectorAll: () => [close, previous, next],
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
      close.focus();
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
  const buttons = ["first", "second", "third"].map((id) => ({
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
      activeElement = this;
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
      get activeElement() { return activeElement; },
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
  assert.equal(s.focus, "previous");
  s.events.click({ target: s.dialog, clientX: 30, clientY: 30 });
  assert.equal(s.dialog.open, false);
  assert.equal(s.focus, "first");
  assert.equal(s.classes.has("modal-open"), false);
});

test("arrow buttons move in page order, wrap both ways, and return focus to the opener", async () => {
  const s = setup();
  const opening = s.buttons[0].click();
  s.requests[0].resolve();
  await opening;
  for (const [control, expected] of [
    ["previous", "third"], ["next", "first"], ["next", "second"],
  ]) {
    const pending = s.events[control + ":click"]();
    assert.equal(s.dialog.open, true);
    assert.equal(s.image.src, expected + "-thumb.webp");
    assert.equal(s.image.alt, expected);
    s.requests.at(-1).resolve();
    await pending;
    assert.equal(s.image.src, expected + ".webp");
  }
  s.dialog.close();
  assert.equal(s.focus, "first");
});

test("keyboard arrows handle rapid navigation and stale downloads, including failures", async () => {
  const s = setup();
  s.buttons[0].click();
  let prevented = 0;
  const key = (key) => s.events.keydown({ key, preventDefault() { prevented++; } });
  const second = key("ArrowRight");
  const third = key("ArrowRight");
  s.requests[0].resolve();
  s.requests[1].reject(new Error("stale failure"));
  await second;
  assert.equal(s.image.src, "third-thumb.webp");
  assert.equal(s.error.hidden, true);
  assert.equal(s.dialog.attrs["aria-busy"], "true");
  s.requests[2].resolve();
  await third;
  assert.equal(s.image.src, "third.webp");
  const back = key("ArrowLeft");
  s.requests[3].reject(new Error("offline"));
  await back;
  assert.equal(s.image.src, "second-thumb.webp");
  assert.equal(s.error.hidden, false);
  const retry = key("ArrowLeft");
  assert.equal(s.error.hidden, true);
  s.requests[4].resolve();
  await retry;
  assert.equal(s.image.src, "first.webp");
  assert.equal(prevented, 4);
});

test("Tab and Shift+Tab cycle through close and both arrows", () => {
  const s = setup();
  s.buttons[0].click();
  const tab = (shiftKey = false) => s.events.keydown({ key: "Tab", shiftKey, preventDefault() {} });
  tab(true);
  assert.equal(s.focus, "next");
  tab();
  assert.equal(s.focus, "close");
  tab();
  assert.equal(s.focus, "previous");
  tab();
  assert.equal(s.focus, "next");
  tab();
  assert.equal(s.focus, "close");
});
