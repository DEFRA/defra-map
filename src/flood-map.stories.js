import React, { useEffect, useRef } from 'react'
import { FloodMap } from './flood-map'
import './flood-map.scss'

// Inline React Wrapper inside the story file
const FloodMapStoryWrapper = ({ behaviour, place, zoom, minZoom, maxZoom }) => {
  const targetRef = useRef(null)

  useEffect(() => {
    if (!targetRef.current) {
      return
    }

    const fm = new FloodMap('map', { behaviour, place, zoom, minZoom, maxZoom })
    
  }, [behaviour, place, zoom, minZoom, maxZoom])

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
  title: 'FloodMap',
  component: FloodMapStoryWrapper,
  argTypes: {
    behaviour: { control: 'text' },
    place: { control: 'text' },
    zoom: { control: 'number' },
    minZoom: { control: 'number' },
    maxZoom: { control: 'number' }
  },
}

const Template = (args) => <FloodMapStoryWrapper {...args} />

export const Default = Template.bind({})

Default.args = {
  behaviour: 'hybrid',
  place: 'Carlisle',
  zoom: 14,
  minZoom: 10,
  maxZoom: 20,
}