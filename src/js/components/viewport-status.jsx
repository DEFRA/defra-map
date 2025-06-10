import React from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { useStatus } from '../hooks/use-status'

export default function ViewportStatus () {
  const { id } = useApp().options
  const { isStatusVisuallyHidden, isUrlUpdate } = useViewport()
  const status = useStatus()

  return (
    <div className={`fm-c-status${isStatusVisuallyHidden || !status ? ' fm-u-visually-hidden' : ''}`} aria-live={isUrlUpdate ? 'polite' : 'assertive'}>
      <div id={`${id}-viewport-description`} className='fm-c-status__inner' aria-atomic>
        {status}
      </div>
    </div>
  )
}
