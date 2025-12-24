const units = {
  metric: [
    { threshold: 1, symbol: 'm', unit: 'metre', plural: 'metres', factor: 1 },
    { threshold: 1000, symbol: 'km', unit: 'kilometre', plural: 'kilometres', factor: 0.001 }
  ],
  imperial: [
    { threshold: 1609.344, symbol: 'mi', unit: 'mile', plural: 'miles', factor: 1 / 1609.344 },
    { threshold: 0.9144, symbol: 'yd', unit: 'yard', plural: 'yards', factor: 1 / 0.9144 },
    { threshold: 0.3048, symbol: 'ft', unit: 'foot', plural: 'feet', factor: 1 / 0.3048 }
  ]
}

const getBestScale = (metersPerPx, maxWidthPx, unitSystem) => {
  const maxMeters = metersPerPx * maxWidthPx
  const unitOptions = units[unitSystem]

  // Loop over unitOptions from *largest to smallest*
  for (const { symbol, unit, plural, factor } of unitOptions) {
    const scaled = maxMeters * factor
    const rounded = getRounded(scaled)

    // We want a label like "50 km", not "50000 m"
    if (rounded >= 1 && rounded < 1000) {
      const width = (rounded / factor) / metersPerPx
      if (width <= maxWidthPx) {
        return {
          label: rounded,
          symbol,
          width,
          unit: rounded > 1 ? plural : unit
        }
      }
    }
  }

  // Fallback: pick smallest unit
  const fallback = unitOptions[unitOptions.length - 1]
  const fallbackScaled = maxMeters * fallback.factor
  const fallbackRounded = getRounded(fallbackScaled)
  const fallbackUnit = fallbackRounded > 1 ? fallback.plural : fallback.unit

  return {
    label: fallbackRounded,
    symbol: fallback.symbol,
    width: (fallbackRounded / fallback.factor) / metersPerPx,
    unit: fallbackUnit
  }
}

const getRounded = (num) => {
  // Round to nice numbers: 1, 2, 5, 10, 20, 50, 100...
  const pow10 = Math.pow(10, Math.floor(Math.log10(num)))
  const d = num / pow10
  console.log('num:', num, 'd:', d)
  let rounded
  if (d >= 10) {
    rounded = 10
  } else if (d >= 5) {
    rounded = 5
  } else if (d >= 3) {
    rounded = 3
  } else if (d >= 2) {
    rounded = 2
  } else {
    rounded = 1
  }
  return rounded * pow10
}

export { getBestScale }
