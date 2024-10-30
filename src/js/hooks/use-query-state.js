import { useCallback } from 'react'

const { history } = window

export const useQueryState = (query) => {
  const navigate = (state, url) => {
    history.replaceState(state, '', url)
  }

  const setQuery = useCallback(
    value => {
      const existingQueries = new URLSearchParams(window.location.search)

      existingQueries.delete(query)
      existingQueries.set(query, value)
      const queryString = existingQueries.toString()

      navigate(window.history.state, `${window.location.pathname}?${decodeURIComponent(queryString)}`)
    },
    [navigate, query]
  )

  return [
    (new URLSearchParams(window.location.search)).get(query),
    setQuery
  ]
}
