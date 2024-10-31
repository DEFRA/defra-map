import React from 'react'
import { useApp } from '../store/use-app'

export default function Attribution () {
  const { provider } = useApp()

  const attribution = provider?.attribution

  return (
    <>
      {attribution?.logo && attribution?.label
        ? <img className='fm-c-attribution' alt={attribution.label} src={attribution.logo} width='90' height='24' style={{ pointerEvents: 'auto', display: 'block' }} />
        : <span className='fm-c-spacer' />}
    </>
  )
}
