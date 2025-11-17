import { useContext } from 'react'

import { ServiceContext } from './ServiceProvider.jsx'

export function useService () {
  return useContext(ServiceContext)
}
