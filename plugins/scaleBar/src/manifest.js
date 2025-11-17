// src/plugins/scaleBar/manifest.js
import './scaleBar.scss'
import { ScaleBar } from './ScaleBar.jsx'

export const manifest = {
  controls: [{
    id: 'scaleBar',
    label: 'Scale bar',
    mobile: {
      slot: 'bottom-right'
    },
    tablet: {
      slot: 'bottom-right'
    },
    desktop: {
      slot: 'bottom-right'
    },
    render: ScaleBar
  }]
}
