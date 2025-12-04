export function closeApp (handleExitClick) {
  if (history.state?.isBack) {
    history.back()
    return
  }
  handleExitClick()
}