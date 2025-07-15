import React from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'

export default function Attribution () {
  const { isMobile } = useApp()
  const { attributions } = useViewport()

  return (
    <div className='fm-o-attribution'>
      {!isMobile && !!attributions.length && (
        <div className='fm-c-attribution'>
          {attributions.map((a, i) => {
            const trimmed = a?.trim()
            const isWrapped = /^<p[\s>]/i.test(trimmed) && /<\/p>$/i.test(trimmed)
            const inner = isWrapped ? trimmed.replace(/^<p[\s>]*>/i, '').replace(/<\/p>$/i, '') : trimmed
            return <span key={i} dangerouslySetInnerHTML={{ __html: inner }} />
          })}
        </div>
      )}
    </div>
  )
}
