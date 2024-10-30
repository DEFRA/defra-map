import React from 'react'

export default function Status ({ message, isVisuallyHidden }) {
  return (
    <div className={`fm-c-status${isVisuallyHidden || !message ? ' fm-c-status--visually-hidden' : ''}`} aria-live='assertive' aria-atomic>
      <div className='fm-c-status__inner govuk-body-s'>
        {message}
      </div>
    </div>
  )
}
