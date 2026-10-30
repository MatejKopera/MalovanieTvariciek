// Exercise the production submit handler with a fake transport: no email is sent.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../script.js", import.meta.url), "utf8");
function setup(transport, { valid = true, honey = "" } = {}) {
  let submit,
    timer,
    calls = 0;
  const label = { textContent: "" };
  const button = { disabled: false, querySelector: () => label };
  const classes = new Set();
  const status = {
    hidden: true,
    textContent: "",
    classList: { add: (x) => classes.add(x), remove: (x) => classes.delete(x) },
  };
  const form = {
    resets: 0,
    fields: {
      Meno: "Test",
      email: "test@example.invalid",
      Datum: "",
      Sprava: "Test",
    },
    elements: { namedItem: () => ({ value: honey }) },
    reportValidity: () => valid,
    addEventListener: (_, handler) => {
      submit = handler;
    },
    querySelector: () => button,
    querySelectorAll: () => [],
    setAttribute() {},
    removeAttribute() {},
    reset() {
      this.resets++;
      this.fields.Meno = "";
    },
  };
  vm.runInNewContext(source, {
    document: {
      querySelector: (selector) =>
        ({ "#booking-form": form, "#form-status": status })[selector] ?? null,
      querySelectorAll: () => [],
      addEventListener() {},
    },
    window: { matchMedia: () => ({ addEventListener() {} }) },
    AbortController,
    FormData: class {
      constructor(f) {
        return Object.entries(f.fields);
      }
    },
    fetch: async (...args) => {
      calls++;
      return transport(...args);
    },
    setTimeout: (fn) => {
      timer = fn;
      return 1;
    },
    clearTimeout() {},
  });
  return {
    form,
    button,
    label,
    status,
    classes,
    submit: () => submit({ preventDefault() {} }),
    calls: () => calls,
    timeout: () => timer(),
  };
}
const response = (success, ok = true) => ({
  ok,
  json: async () => ({ success }),
});
test("required/invalid input and honeypot never send a request", async () => {
  for (const options of [{ valid: false }, { honey: "bot" }]) {
    const s = setup(() => response(true), options);
    await s.submit();
    assert.equal(s.calls(), 0);
    assert.equal(s.form.resets, 0);
  }
});
test("confirmed success clears form and announces success", async () => {
  for (const result of [true, "true"]) {
    const s = setup(() => response(result));
    await s.submit();
    assert.equal(s.form.resets, 1);
    assert.equal(s.button.disabled, false);
    assert.match(s.status.textContent, /bola odoslaná/);
    assert.equal(s.status.hidden, false);
  }
});
test("HTTP, API, malformed JSON and network failures retain the message", async () => {
  for (const transport of [
    () => response(true, false),
    () => response(false),
    () => response("false"),
    () => response(undefined),
    () => ({
      ok: true,
      json: async () => {
        throw Error("bad JSON");
      },
    }),
    () => {
      throw Error("network");
    },
  ]) {
    const s = setup(transport);
    await s.submit();
    assert.equal(s.form.resets, 0);
    assert.equal(s.form.fields.Meno, "Test");
    assert.equal(s.button.disabled, false);
    assert.ok(s.classes.has("is-error"));
    assert.match(s.status.textContent, /nepodarilo/);
  }
});
test("slow requests disable duplicate submissions until completion", async () => {
  let resolve;
  const s = setup(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const pending = s.submit();
  assert.equal(s.button.disabled, true);
  assert.equal(s.label.textContent, "Odosielam…");
  await s.submit();
  assert.equal(s.calls(), 1);
  resolve(response(true));
  await pending;
  assert.equal(s.button.disabled, false);
});
test("timed out requests preserve data and allow a retry", async () => {
  const s = setup(
    (_, options) =>
      new Promise((_, reject) =>
        options.signal.addEventListener("abort", () =>
          reject(Error("timeout")),
        ),
      ),
  );
  const pending = s.submit();
  s.timeout();
  await pending;
  assert.equal(s.form.resets, 0);
  assert.equal(s.button.disabled, false);
  assert.ok(s.classes.has("is-error"));
});
