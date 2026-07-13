import "global-jsdom/register";
import { register } from "node:module";


// Register CSS module loader hook for node:test
register("./css-loader.mjs", import.meta.url);

// Polyfill import.meta.env
if (typeof import.meta === 'undefined') {
  (global as any).import = { meta: { env: { BASE_URL: '/' } } };
} else if (!import.meta.env) {
  (import.meta as any).env = { BASE_URL: '/' };
}

// Mock InterSectionObserver and animation frames
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0);
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
(globalThis as any).IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
if (typeof window !== 'undefined') {
  (window as any).IntersectionObserver = (globalThis as any).IntersectionObserver;
}
