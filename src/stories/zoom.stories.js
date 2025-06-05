import React, { useEffect, useRef } from 'react'
import { FloodMap } from '../flood-map'
import '../flood-map.scss'

// Inline React Wrapper inside the story file
const FloodMapStoryWrapper = (options) => {
  const targetRef = useRef(null)

  useEffect(() => {
    if (!targetRef.current) {
      return
    }

    const fm = new FloodMap('map', options)

    fm.addEventListener('ready', () => {
      console.log('ready')
    })
  })

  return (
    <div>
      <div
        id='map'
        ref={targetRef}
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default {
  title: 'Zoom',
  component: FloodMapStoryWrapper,
  argTypes: {
    behaviour: {
      control: 'select',
      options: ['buttonFirst', 'hybrid', 'inline']
    },
    maxZoom: { control: 'number' },
    minZoom: { control: 'number' },
    zoom: { control: 'number' },
    center: { control: 'object' },
    styles: { control: 'object' }
  }
}

export const index = {
  name: 'index',
  tags: ['visual-test'],
  args: {
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
}
