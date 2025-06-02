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
  title: 'Behaviour',
  component: FloodMapStoryWrapper,
  argTypes: {
    behaviour: { control: 'text' },
    place: { control: 'text' },
    backgroundColor: { control: 'text' }
    // styles: { control: 'object' }
  }
}

export const ButtonFirst = { // Changed from 'Default' to 'ButtonFirst'
  name: 'buttonFirst',
  tags: ['visual-test'],
  args: {
    behaviour: 'buttonFirst',
    backgroundColor: 'default: #f5f5f0, dark: #162639'
    // styles: [{
    //   name: 'default',
    //   attribution: 'Attribution',
    //   url: 'https://labs.os.uk/tiles/styles/open-zoomstack-outdoor/style.json'
    // }]
  }
}

export const Hybrid = { // Changed from 'Default' to 'ButtonFirst'
  name: 'hybrid',
  tags: ['visual-test'],
  args: {
    behaviour: 'hybrid',
    backgroundColor: 'default: #f5f5f0, dark: #162639'
    // styles: [{
    //   name: 'default',
    //   attribution: 'Attribution',
    //   url: 'https://labs.os.uk/tiles/styles/open-zoomstack-outdoor/style.json'
    // }]
  }
}
