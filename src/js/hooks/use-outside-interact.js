import { useEffect } from 'react'

/**
 * Hook that alerts clicks outside of the passed ref
 */
export const useOutsideInteract = (ref, isModal, type, callback) => {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleInteractOutside (e) {
      if (ref.current && !ref.current.contains(e.target)) {
        callback(e)
      }
    }
    // Bind the event listener
    document.addEventListener(type, handleInteractOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener(type, handleInteractOutside)
    }
  }, [ref, isModal])
}
