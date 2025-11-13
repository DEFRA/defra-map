export function constrainKeyboardFocus (containerEl, e) {
  if (e.key !== 'Tab') {
    return
  }

  const selectors = [
    'a[href]:not([disabled])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '*[tabindex="0"]:not([disabled])'
  ]
  let focusableEls = Array.from(containerEl.querySelectorAll(selectors.join(',')))
  focusableEls = focusableEls.filter(focusableEl => !!focusableEl.offsetParent)
  const firstFocusableEl = focusableEls[0]
  const lastFocusableEl = focusableEls[focusableEls.length - 1]

  if (e.shiftKey && (document.activeElement === containerEl || document.activeElement === firstFocusableEl)) {
    lastFocusableEl.focus()
    e.preventDefault()
  }
  if (!e.shiftKey && (document.activeElement === lastFocusableEl)) {
    firstFocusableEl.focus()
    e.preventDefault()
  }
}
