import { afterEach, beforeEach } from "vitest";

// Enable React 19 act() support in the test environment.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});
