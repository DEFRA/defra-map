// /plugins/search/manifest.js
import { initialState, actions } from './reducer.js'
import { Search as SearchIcon } from 'lucide-react'
import { Search } from './Search.jsx'

export const manifest = {
  reducer: {
    initialState,
    actions
  },

  controls: [{
    id: 'search',
    label: 'Search',
    mobile: {
      slot: 'top-right'
    },
    tablet: {
      slot: 'top-left'
    },
    desktop: {
      slot: 'top-left'
    },
    render: Search
  }],

  icons: [{
    id: 'search',
    component: SearchIcon
  }]
}
