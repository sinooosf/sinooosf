import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement IntersectionObserver — the ScrollReveal hook
// needs a stub so components using it don't crash inside tests.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver
