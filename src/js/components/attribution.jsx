import React from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { DefaultLogo, DarkLogo } from './logo-os-maps'

export default function Attribution () {
  const { provider } = useApp()
  const { basemap } = useViewport()

  const attribution = provider?.attribution
  const isDarkBasemap = ['dark', 'aerial'].includes(basemap)
  const props = { role: 'img', title: attribution?.label }

  return (
    <>
      {attribution?.logo && attribution?.label
        ? (
          <div className='fm-c-attribution'>
            {isDarkBasemap ? <DarkLogo {...props} /> : <DefaultLogo {...props} />}
          </div>
          )
        : <span className='fm-c-spacer' />}
    </>
  )
}
