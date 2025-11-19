// src/plugins/search/datasets.js
import { parseOsNamesResults } from './utils/parseOsNamesResults.js'

export function createDatasets({ customDatasets = [], osNamesURL }) {
  
  const defaultDatasets = [{
    name: 'osNames',
    urlTemplate: osNamesURL,
    parseResults: parseOsNamesResults,
    includeRegex: /^[a-zA-Z0-9\s,-]+$/,
    excludeRegex: /^(?:[A-Za-z]{2}\s*(?:\d{3}\s*\d{3}|\d{4}\s*\d{4}|\d{5}\s*\d{5})|\d+\s*,?\s*\d+)$/i // exclude gridrefs/numeric coords
  }]

  return [...defaultDatasets, ...customDatasets]
}
