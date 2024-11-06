export const updateTitle = () => {
  const page = document.querySelector('[data-fm-page]')?.getAttribute('data-fm-page')
  document.documentElement.classList.toggle('fm-page', !!page)
  const parts = document.title.split(' - ')
  const title = parts[parts.length - 1]
  document.title = page ? `${page} - ${title}` : title
}

export const toggleInert = () => {
  let el = document.activeElement

  const isPage = !!document.querySelector('[data-fm-page]')
  const container = document.querySelector('[data-fm-page]') || el?.closest('[data-fm-container]')
  const modal = container?.querySelector('[aria-modal="true"][open]')
  const isWithinModal = modal?.contains(el)
  const isWithinContainer = container?.contains(el)

  el = (isPage || isWithinContainer) && isWithinModal
    ? modal
    : isPage
      ? container
      : null

  const inert = document.querySelectorAll('[data-fm-inert]')
  for (let i = 0; i < inert.length; i++) {
    const el = inert[i]
    el.removeAttribute('aria-hidden')
    el.removeAttribute('data-fm-inert')
  }
  if (el) {
    while (el.parentNode && el !== document.body) {
      let sibling = el.parentNode.firstChild
      while (sibling) {
        if (sibling.nodeType === 1 && sibling !== el) {
          if (!sibling.hasAttribute('aria-hidden')) {
            sibling.setAttribute('aria-hidden', true)
            sibling.setAttribute('data-fm-inert', '')
          }
        }
        sibling = sibling.nextSibling
      }
      el = el.parentNode
    }
  }
}

export const setInitialFocus = () => {
  let el = document.activeElement

  const isPage = !!document.querySelector('[data-fm-page]')
  const container = document.querySelector('[data-fm-page]') || el?.closest('[data-fm-container]')
  const modal = container?.querySelector('[aria-modal="true"][open]')
  const isWithinModal = modal?.contains(el)
  const isWithinContainer = container?.contains(el)

  el = (isPage || isWithinContainer) && modal && !isWithinModal
    ? modal
    : isPage && !isWithinContainer
      ? container.querySelector('[data-fm-viewport]')
      : null

  if (!el) return

  el.focus()
}

export const constrainFocus = e => {
  if (e.key !== 'Tab') return

  const el = document.activeElement.closest('[aria-modal="true"][open], [data-fm-page]')

  if (!el) return

  const selectors = [
    'a[href]:not([disabled])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '*[tabindex="0"]:not([disabled])'
  ]
  let focusableEls = Array.from(el.querySelectorAll(selectors.join(',')))
  focusableEls = focusableEls.filter(e => !!e.offsetParent)
  const firstFocusableEl = focusableEls[0]
  const lastFocusableEl = focusableEls[focusableEls.length - 1]

  if (e.shiftKey) {
    if (document.activeElement === el || document.activeElement === firstFocusableEl) {
      lastFocusableEl.focus()
      e.preventDefault()
    }
  } else {
    if (document.activeElement === lastFocusableEl) {
      firstFocusableEl.focus()
      e.preventDefault()
    }
  }
}

export const findTabStop = (el, direction) => {
  const focusableEls = document.querySelectorAll('input, button, select, textarea, a[href]')
  const list = Array.prototype.filter.call(focusableEls, item => { return item.tabIndex >= '0' })
  const index = list.indexOf(el)
  // if (direction === 'next') {
  //   console.log(el.outerHTML)
  //   console.log(list[14].outerHTML)
  // }
  return list[direction === 'next' ? index + 1 : index - 1] || list[0]
}
