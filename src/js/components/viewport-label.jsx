import React from 'react'
import { useApp } from '../store/use-app'

export default function ViewportLabel () {
  const { options } = useApp()
  const { id } = options

  return (
    <div id={`${id}-viewport-label`} className='fm-c-panel fm-c-panel--viewport-label govuk-body-s'>
      <span className='fm-u-visually-hidden'>Interactive map. </span><kbd>Alt</kbd> + <kbd>K</kbd> <span className='fm-u-visually-hidden'>Show</span> keyboard controls<span className='fm-u-visually-hidden'>.</span>
    </div>
  )
}
