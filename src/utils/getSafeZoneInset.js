export const getSafeZoneInset = ({
  mainRef,
  insetRef,
  rightRef,
  actionsRef
}) => {
  const main = mainRef.current
  const inset = insetRef.current
  const right = rightRef.current
  const actions = actionsRef.current

  const root = document.documentElement
  const dividerGap = Number.parseInt(getComputedStyle(root).getPropertyValue('--divider-gap'), 10)

  // === Safe area logic ===
  const availableHeight = actions.offsetTop - inset.offsetTop - dividerGap
  const rightOffset = inset.offsetLeft + right.offsetWidth + dividerGap
  const availableWidth = main.offsetWidth - rightOffset * 2
  const insetOverlapWidth = inset.offsetWidth - rightOffset + inset.offsetLeft
  const isLandscape = availableWidth - insetOverlapWidth > availableHeight - inset.offsetHeight
  const topOffset = inset.offsetTop + (!isLandscape && inset.offsetHeight > 0 ? inset.offsetHeight + dividerGap : 0)
  const leftOffset = isLandscape ? inset.offsetWidth + inset.offsetLeft + dividerGap : rightOffset
  const actionsOffset = main.offsetHeight - actions.offsetTop

  const RATIO = 3
  const hasRoom = insetOverlapWidth < availableWidth / RATIO && inset.offsetHeight < availableHeight / RATIO

  return {
    top: hasRoom ? inset.offsetTop : topOffset,
    right: rightOffset,
    left: main.offsetLeft + (hasRoom ? rightOffset : Math.max(leftOffset, rightOffset)),
    bottom: actionsOffset + dividerGap
  }
}
