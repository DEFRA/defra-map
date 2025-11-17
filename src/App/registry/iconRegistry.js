// src/icons/iconRegistry.js
import { X as CloseIcon } from 'lucide-react'

let iconRegistry = {
  close: CloseIcon
}

export const registerIcon = (icon) => {
  iconRegistry = { ...iconRegistry, ...icon }
}

export const getIconRegistry = () => iconRegistry
