import React from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'

export default function Attribution () {
  const { isMobile } = useApp()
  const { attribution } = useViewport().style

  return (
    <div className='fm-o-attribution'>
      {!isMobile && attribution && (
        <div className='fm-c-attribution' {...({ dangerouslySetInnerHTML: { __html: attribution } })} />
      )}
    </div>
  )
}
