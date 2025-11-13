import { useEffect } from 'react'
import { getMediaState } from '../../utils/getMediaState.js'

export function useMediaQueryDispatch (dispatch, { maxMobileWidth, minDesktopWidth, appColorScheme, autoColorScheme }) {
  useEffect(() => {
    const queries = [
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-reduced-motion: reduce)')
    ]

    function updateMedia () {
      const { preferredColorScheme, prefersReducedMotion } = getMediaState()

      dispatch({
        type: 'SET_MEDIA',
        payload: {
          preferredColorScheme: autoColorScheme ? preferredColorScheme : appColorScheme,
          prefersReducedMotion
        }
      })
    }

    queries.forEach(query => query.addEventListener('change', updateMedia))

    return () => {
      queries.forEach(query => query.removeEventListener('change', updateMedia))
    }
  }, [dispatch])
}
