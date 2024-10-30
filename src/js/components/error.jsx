import React from 'react'
import { useApp } from '../store/use-app'

export default function Error () {
  const { message } = useApp().error

  return (
    <p>{message}</p>
  )
}
