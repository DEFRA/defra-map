export function findTabStop ({ el, direction }) {
  const focusableEls = document.querySelectorAll('input, button, select, textarea, a[href]')
  const list = Array.prototype.filter.call(focusableEls, item => {
    return item.tabIndex >= 0
  })
  const index = list.indexOf(el)
  return list[direction === 'next' ? index + 1 : index - 1] || list[0]
}
