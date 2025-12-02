import { useEffect } from 'react'
import { useApp } from '../store/appContext.js'

export function useFocusVisible () {
  const { interfaceType, layoutRefs } = useApp()

  useEffect(() => {
    const scope = layoutRefs.appContainerRef.current
    if (!scope) {
      return
    }

    // Use data attribute to avoid React diff wiping
    function handleFocusIn (e) {
      e.target.dataset.focusVisible = interfaceType === 'keyboard'
    }

    function handleFocusOut (e) {
      delete e.target.dataset.focusVisible
    }

    function handlePointerdown (e) {
      delete document.activeElement.dataset.focusVisible
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
    document.addEventListener('pointerdown', handlePointerdown)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      document.removeEventListener('pointerdown', handlePointerdown)
    }
  }, [interfaceType, layoutRefs.appContainerRef])
}
