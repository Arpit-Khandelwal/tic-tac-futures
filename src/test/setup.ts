import { beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Default every test to a "returning visitor" so the first-visit tour does not
// auto-open and interfere with unrelated suites. The onboarding tests override
// this precondition explicitly per test.
beforeEach(() => {
  try {
    localStorage.setItem('ttt-tour-seen', '1');
  } catch {
    // jsdom always provides localStorage; ignore if unavailable.
  }
});
