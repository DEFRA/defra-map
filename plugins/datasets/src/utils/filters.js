/**
 * Adds an exclusion clause for specified feature IDs to an existing filter.
 * Returns a new MapLibre expression.
 */
export const excludeFeatureFromFilter = (filter, featureIds) => {
  const excludeClause = ['!', ['in', ['get', 'id'], ['literal', featureIds]]]

  if (!filter) {
    return ['all', excludeClause]
  }

  if (filter[0] !== 'all') {
    return ['all', filter, excludeClause]
  }

  return [...filter, excludeClause]
}

/**
 * Restores the original filter expression.
 */
export const restoreOriginalFilter = (originalFilter) => originalFilter
