import '@testing-library/jest-dom/vitest'

Object.defineProperty(window, 'matchMedia', {
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
})

// jsdom doesn't implement HTMLDialogElement methods
HTMLDialogElement.prototype.showModal =
  HTMLDialogElement.prototype.showModal ||
  vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
HTMLDialogElement.prototype.close =
  HTMLDialogElement.prototype.close ||
  vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  })
