import React from 'react'
import { useApp } from '../store/use-app.js'

export default function Banner () {
  const { banner, activePanel, isMobile } = useApp()

  return (
    <div className='fm-c-banner'>
      {banner && (
        <div className='fm-c-banner__inner' {...activePanel === 'SEARCH' && isMobile ? { style: { display: 'none' } } : {}}>
          <span className='fm-c-banner__icon' aria-hidden='true'>!</span>
          <span className='fm-c-banner__content' {...({ dangerouslySetInnerHTML: { __html: banner } })} />
        </div>
      )}
      <div role='status' className='fm-u-visually-hidden' dangerouslySetInnerHTML={{ __html: `Warning: ${banner}` }} />
    </div>
  )
}
