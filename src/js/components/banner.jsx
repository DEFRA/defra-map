import React from 'react'
import { useApp } from '../store/use-app.js'

export default function Banner () {
  const { options, activePanel } = useApp()

  return (
    <>
      {options?.banner && (
        <div className='fm-c-banner' {...['SEARCH', 'STYLE'].includes(activePanel) ? { style: { display: 'none' } } : {}}>
          <span className='fm-c-banner__icon' aria-hidden='true'>!</span>
          <span className='fm-c-banner__content' {...({ dangerouslySetInnerHTML: { __html: options.banner } })} />
        </div>
      )}
    </>
  )
}
