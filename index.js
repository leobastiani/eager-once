// @ts-check

/** @type {(() => Promise<void>)[]} */
const setups = [];

/** @type {Set<() => void>} */
const resets = new Set();

function resetAll() {
  for (const fn of resets) {
    fn();
  }
  resets.clear();
}

/**
 * @template T
 * @param {(...args: any[]) => T} fn
 * @returns {() => Awaited<T>}
 */
function once(fn) {
  /** @type {any} */ let result;
  const reset = () => {
    result = undefined;
  };
  const setup = async () => {
    resets.add(reset);
    if (result) {
      throw new Error("a setup has already been called");
    }
    result = { loading: true };
    try {
      result = { return: await fn() };
    } catch (e) {
      result = { error: e };
    }
  };
  setups.push(setup);
  return () => {
    if (!result) {
      throw new Error("a setup has not been called");
    }
    if (result.loading) {
      throw new Error("a setup is in progress");
    }
    if (result.error) {
      throw result.error;
    }
    return result.return;
  };
}

export const eagerOnce = {
  value: once,
  /**
   * @template T
   * @param {(...args: any[]) => T} fn
   * @returns {Awaited<T>}
   */
  fn(fn) {
    const ret = once(fn);
    // @ts-expect-error it's fine
    return (...args) => ret()(...args);
  },
  async setup() {
    for (const setup of setups) {
      await setup();
    }
  },
  resetAll,
};

export default eagerOnce;
