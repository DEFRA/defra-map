export function getInitialOpenPanels (panelConfig, breakpoint, prevOpenPanels = {}) {
  const openPanels = {}

  Object.keys(panelConfig).forEach((panelId) => {
    const configPanel = panelConfig[panelId]
    const bpConfig = configPanel[breakpoint]

    const isInitiallyOpen = bpConfig?.initiallyOpen ?? false

    if (isInitiallyOpen) {
      // Preserve any props that were already set in state
      openPanels[panelId] = prevOpenPanels[panelId] || { props: {} }
    }
  })

  return openPanels
}
