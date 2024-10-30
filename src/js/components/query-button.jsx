import React from 'react'
import { useApp } from '../store/use-app'

export default function QueryButton () {
  const { queryPolygon } = useApp()

  return (
    <button className='fm-c-btn fm-c-btn--primary govuk-body-s'>
      {queryPolygon.submitLabel}
    </button>
  )
}
