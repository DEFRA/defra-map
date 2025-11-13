export function toggleInertElements ({ containerEl, isFullscreen, boundaryEl = document.body }) {
  let inertElements = Array.from(boundaryEl.querySelectorAll('[data-fm-inert]'))

  if (containerEl) {
    inertElements = inertElements.filter(el => !containerEl.contains(el))
  }

  inertElements.forEach(el => {
    el.removeAttribute('aria-hidden')
    el.removeAttribute('data-fm-inert')
  })

  if (!isFullscreen) return

  document.activeElement?.blur()

  let el = containerEl
  while (el?.parentNode && el !== boundaryEl && el !== document.body) {
    const parent = el.parentNode
    for (const sibling of parent.children) {
      if (
        sibling !== el &&
        (!containerEl || !containerEl.contains(sibling)) &&
        sibling.matches(':not([aria-hidden]):not([data-fm-inert])') &&
        boundaryEl.contains(sibling)
      ) {
        sibling.setAttribute('aria-hidden', 'true')
        sibling.setAttribute('data-fm-inert', '')
      }
    }
    el = parent
  }
}
