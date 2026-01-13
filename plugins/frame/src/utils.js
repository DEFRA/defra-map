/**
 * Compute inset positions for a child div that is centered, respects aspect ratio, and max width per breakpoint.
 *
 * @param {number} parentWidth - Width of the container (px)
 * @param {number} parentHeight - Height of the container (px)
 * @param {object} config - { aspectRatio: number, mobileWidth: string, tabletWidth: string, desktopWidth: string }
 * @param {string} breakpoint - 'mobile' | 'tablet' | 'desktop'
 * @returns {{top:number, left:number, width:number, height:number}} - positions in px
 */
function computeInset(parentWidth, parentHeight, config, breakpoint) {
  // pick max width for current breakpoint
  const maxWidth = Number.parseInt(config[`${breakpoint}Width`] || parentWidth, 10)

  // start with max width
  let width = Math.min(maxWidth, parentWidth)
  let height = width / config.aspectRatio

  // check if height exceeds container
  if (height > parentHeight) {
    height = parentHeight
    width = height * config.aspectRatio
  }

  const left = (parentWidth - width) / 2
  const top = (parentHeight - height) / 2

  return { top, left, width, height }
}

export {
  computeInset
}
