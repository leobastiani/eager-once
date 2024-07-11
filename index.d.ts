export namespace eagerOnce {
  export function value<T>(fn: (...args: any[]) => T): () => Awaited<T>;
  export function fn<T>(fn: (...args: any[]) => T): Awaited<T>;
  export function setup(): Promise<void>;
  export function resetAll(): void;
}

export default eagerOnce;
