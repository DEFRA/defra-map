import React from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'

export default function Attribution () {
  const { isMobile } = useApp()
  const { style } = useViewport()

  return (
    <div className='fm-o-attribution'>
      {!isMobile && style?.attribution && (
        <div className='fm-c-attribution' {...({ dangerouslySetInnerHTML: { __html: style?.attribution } })} />
      )}
    </div>
  )
}
