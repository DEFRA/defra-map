import React, { useEffect, useRef } from 'react'
import { FloodMap } from './flood-map'
import './flood-map.scss'

// Inline React Wrapper inside the story file
const FloodMapStoryWrapper = (options) => {
  const targetRef = useRef(null)

  useEffect(async () => {
    if (!targetRef.current) {
      return
    }

    const Provider = (await import('./js/provider/esri-sdk/provider.js')).default

    const fm = new FloodMap('map', {
      ...options,
      provider: Provider
    })

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
  title: 'FloodMap/ESRI',
  component: FloodMapStoryWrapper,
  argTypes: {
    behaviour: { control: 'text' },
    place: { control: 'text' },
    zoom: { control: 'number' },
    center: { control: 'object' },
    minZoom: { control: 'number' },
    maxZoom: { control: 'number' },
    backgroundColor: { control: 'text' },
    styles: { control: 'object' }
  }
}

const Template = (args) => <FloodMapStoryWrapper {...args} />

export const Default = Template.bind({})

Default.args = {
  behaviour: 'hybrid',
  place: 'Carlisle',
  zoom: 14,
  center: [-2.938769, 54.893806],
  minZoom: 10,
  maxZoom: 20,
  backgroundColor: 'default: #f5f5f0, dark: #162639',
  styles: [{
    name: 'default',
    attribution: 'Attribution',
    url: 'https://labs.os.uk/tiles/styles/open-zoomstack-outdoor/style.json'
  }]
}
