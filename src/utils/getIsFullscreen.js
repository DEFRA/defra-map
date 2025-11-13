export const getIsFullscreen = (behaviour, breakpoint) => {
  return ['mapOnly', 'buttonFirst'].includes(behaviour) || breakpoint === 'mobile' && behaviour === 'hybrid'
}