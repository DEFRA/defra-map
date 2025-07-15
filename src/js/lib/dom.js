const ATTR_PAGE = 'data-fm-page'
const ARIA_HIDDEN = 'aria-hidden'

const getContainer = (el) => {
  const isPage = !!document.querySelector(`[${ATTR_PAGE}]`)
  let container = document.querySelector(`[${ATTR_PAGE}]`) || el?.closest('[data-fm-container]')
  let modal = container?.querySelector('[aria-modal="true"][open]')
  const isWithinModal = modal?.contains(el)
  const isWithinContainer = container?.contains(el)
  modal = (isPage || isWithinContainer) && isWithinModal && modal
  container = isPage && container

  return modal || container
}

export const updateTitle = () => {
  const page = document.querySelector(`[${ATTR_PAGE}]`)?.getAttribute(ATTR_PAGE)
  document.documentElement.classList.toggle('fm-page', !!page)
  const parts = document.title.split(': ')
  const title = parts[parts.length - 1]
  document.title = page ? `${page}: ${title}` : title
}

export const toggleInert = (activeEl) => {
  const inertEls = document.querySelectorAll('[data-fm-inert]')
  for (const inertEl of inertEls) {
    inertEl.removeAttribute(ARIA_HIDDEN)
    inertEl.removeAttribute('data-fm-inert')
  }

  let el = getContainer(activeEl || document.activeElement)

  if (!el) {
    return
  }

  while (el.parentNode && el !== document.body) {
    let sibling = el.parentNode.firstChild
    while (sibling) {
      if (sibling.nodeType === 1 && sibling !== el && !sibling.hasAttribute(ARIA_HIDDEN)) {
        sibling.setAttribute(ARIA_HIDDEN, true)
        sibling.setAttribute('data-fm-inert', '')
      }
      sibling = sibling.nextSibling
    }
    el = el.parentNode
  }
}

export const setInitialFocus = () => {
  let el = document.activeElement

  const isPage = !!document.querySelector(`[${ATTR_PAGE}]`)
  const container = document.querySelector(`[${ATTR_PAGE}]`) || el?.closest('[data-fm-container]')
  let modal = container?.querySelector('[aria-modal="true"][open]')
  const isWithinModal = modal?.contains(el)
  const isWithinContainer = container?.contains(el)
  modal = ((isPage || isWithinContainer) && modal && !isWithinModal) && modal
  const viewport = isPage && !isWithinContainer && container.querySelector('[data-fm-viewport]')
  el = modal || viewport

  if (el) {
    el.focus()
  }
}

export const constrainFocus = e => {
  if (e.key !== 'Tab') {
    return
  }

  const el = document.activeElement.closest(`[aria-modal="true"][open], [${ATTR_PAGE}]`)

  if (!el) {
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
  let focusableEls = Array.from(el.querySelectorAll(selectors.join(',')))
  focusableEls = focusableEls.filter(focusableEl => !!focusableEl.offsetParent)
  const firstFocusableEl = focusableEls[0]
  const lastFocusableEl = focusableEls[focusableEls.length - 1]

  if (e.shiftKey && (document.activeElement === el || document.activeElement === firstFocusableEl)) {
    lastFocusableEl.focus()
    e.preventDefault()
  }
  if (!e.shiftKey && (document.activeElement === lastFocusableEl)) {
    firstFocusableEl.focus()
    e.preventDefault()
  }
}

export const findTabStop = (el, direction) => {
  const focusableEls = document.querySelectorAll('input, button, select, textarea, a[href]')
  const list = Array.prototype.filter.call(focusableEls, item => { return item.tabIndex >= '0' })
  const index = list.indexOf(el)
  return list[direction === 'next' ? index + 1 : index - 1] || list[0]
}
