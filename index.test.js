// @ts-check

import assert from "node:assert";
import { test } from "node:test";
import eagerOnce from "./index.js";

test.afterEach(() => {
  eagerOnce.resetAll();
});

test("success", async () => {
  let called = 0;
  const oneValue = eagerOnce.value(() => {
    called++;
    return 1;
  });
  const oneAwaited = eagerOnce.value(() => {
    called++;
    return Promise.resolve(1);
  });
  const fn = eagerOnce.fn(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
    return (/** @type {number} */ x) => x + 1;
  });
  await eagerOnce.setup();
  assert.equal(called, 2);
  assert.equal(oneValue(), 1);
  assert.equal(oneAwaited(), 1);
  assert.equal(fn(1), 2);

  assert.equal(called, 2);
  assert.equal(oneValue(), 1);
  assert.equal(oneAwaited(), 1);
  assert.equal(fn(2), 3);

  eagerOnce.resetAll();
  await eagerOnce.setup();

  assert.equal(called, 4);
  assert.equal(oneValue(), 1);
  assert.equal(oneAwaited(), 1);
  assert.equal(fn(3), 4);
});

test.only("depending on each other", async () => {
  const a = eagerOnce.value(() => {
    return 1;
  });
  const b = eagerOnce.value(() => {
    return a() + 2;
  });
  const c = eagerOnce.fn(async () => {
    const value = a() + b();
    return (/** @type {number} */ x) => x + value;
  });
  await eagerOnce.setup();
  assert.equal(c(10), 14);

  eagerOnce.resetAll();
  await eagerOnce.setup();

  assert.equal(c(11), 15);
});
