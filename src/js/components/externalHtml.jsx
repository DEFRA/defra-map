import React, { memo } from 'react'

const ExternalHtml = memo(({ html, className = '' }) => {
  if (!html) {
    return null
  }
  return <div className={className} {...({ dangerouslySetInnerHTML: { __html: html } })} />
})

export { ExternalHtml }
