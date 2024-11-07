import React from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import DefaultLogo from '../../images/os-logo-maps.svg'
import DarkLogo from '../../images/os-logo-maps-white.svg'

export default function Attribution () {
  const { provider } = useApp()
  const { basemap } = useViewport()

  const attribution = provider?.attribution
  const isDarkBasemap = ['dark', 'aerial'].includes(basemap)
  const props = { width: 90, height: 24 }

  return (
    <>
      {attribution?.logo && attribution?.label
        ? (
          <div className='fm-c-attribution'>
            {isDarkBasemap ? <DarkLogo {...props} /> : <DefaultLogo {...props} />}
          </div>
          // <img className='fm-c-attribution' alt={attribution.label} src={attribution.logo} width='90' height='24' style={{ pointerEvents: 'auto', display: 'block' }} />
          )
        : <span className='fm-c-spacer' />}
    </>
  )
}
