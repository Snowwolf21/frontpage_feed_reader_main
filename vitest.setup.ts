import "@testing-library/jest-dom";
import { vi, beforeEach } from "vitest";

// ── Global browser API stubs ──────────────────────────────────────────────────
// window.open is not available in happy-dom and must be stubbed for tests
// that verify the `v` keyboard shortcut opens a link.
Object.defineProperty(window, "open", {
  writable: true,
  value: vi.fn(),
});

// matchMedia is not implemented in happy-dom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// localStorage stub — happy-dom implements this but this ensures a clean state
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
