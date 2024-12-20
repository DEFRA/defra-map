import React from 'react'
import { useViewport } from '../store/use-viewport.js'
import { DefaultLogo, DarkLogo } from './os-maps-logos.jsx'

export default function Logo () {
  const { basemap } = useViewport()
  const isDarkBasemap = ['dark', 'aerial'].includes(basemap)

  return (
    <div className='fm-c-logo'>
      {isDarkBasemap ? <DarkLogo /> : <DefaultLogo />}
    </div>
  )
}
