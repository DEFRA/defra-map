// cypress/component/visual-regression.cy.js
import React, { useEffect, useRef } from 'react'
import { FloodMap } from '../../src/flood-map'
import '../../src/flood-map.scss'

// Same wrapper used in Storybook
const FloodMapStoryWrapper = (options) => {
  const targetRef = useRef(null)

  useEffect(() => {
    if (!targetRef.current) return

    const fm = new FloodMap('map', options)

    fm.addEventListener('ready', () => {
      console.log('FloodMap is ready')
    })

    return () => fm.destroy?.()
  }, [])

  return (
    <div style={{ height: '400px' }}>
      <div
        id='map'
        ref={targetRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

const defaultArgs = {
  behaviour: 'inline',
  maxZoom: 11,
  minZoom: 9,
  zoom: 10,
  center: [-2.938769, 54.893806],
  styles: [{
    name: 'default',
    attribution: 'Attribution',
    url: 'https://labs.os.uk/tiles/styles/open-zoomstack-outdoor/style.json'
  }]
}

describe('Visual Regression Tests: Zoom (no Storybook)', () => {
  beforeEach(() => {
    // Optional global setup
  })

  it('should hide zoom buttons on mobile', () => {
    cy.viewport('iphone-6')

    cy.mount(<FloodMapStoryWrapper {...defaultArgs} />)
    cy.wait(2000) // wait for map to render

    // Use screenshot instead of compareSnapshot for now
    cy.compareSnapshot('iphone-6-zoom--hidden')
  })

  it('should disable zoom in button', () => {
    cy.viewport('ipad-2')

    cy.mount(<FloodMapStoryWrapper {...defaultArgs} />)
    cy.wait(2000)

    cy.get('.fm-c-btn--zoom-in').click()
    cy.wait(500)
    cy.get('.fm-c-btn--zoom-in').click()
    cy.wait(500)

    // Use screenshot instead of compareSnapshot for now
    cy.compareSnapshot('tablet-zoom--max-zoom')
  })
})