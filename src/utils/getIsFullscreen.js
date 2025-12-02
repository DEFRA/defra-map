export const getIsFullscreen = (behaviour, breakpoint) => {
  return ['mapOnly', 'buttonFirst'].includes(behaviour) || (behaviour === 'hybrid' && breakpoint === 'mobile')
}
