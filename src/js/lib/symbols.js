const { DOMParser } = window

export const parseSVG = (icon, fill, text, isDarkBasemap = false, scale = 1) => {
  const isSelected = icon.includes('selected')
  // let styled = text.replace(/#0f0|#00ff00|#0F0|#00FF00/g, isSelected ? isDarkBasemap ? '#ffffff' : '#0b0c0c' : 'transparent')
  // styled = styled.replace(/#00f|#0000ff|#00F|#0000FF/g, isDarkBasemap ? '#162232' : '#ffffff')
  const parser = new DOMParser()
  const dom = parser.parseFromString(text, 'text/html')
  const svg = dom.querySelector('svg')
  // Add xmlns attribute and class to svg
  // svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.classList.add('fm-c-symbol')
  svg.classList.toggle('fm-c-symbol--selected', isSelected)
  svg.classList.toggle('fm-c-symbol--dark', isDarkBasemap)
  // Set svg height and width
  const viewBox = svg.getAttribute('viewBox')
  const width = parseInt(viewBox.split(' ')[2], 10) * scale
  const height = parseInt(viewBox.split(' ')[3], 10) * scale
  svg.setAttribute('width', width)
  svg.setAttribute('height', height)
  // Conditionally add fill
  if (fill) {
    svg.setAttribute('fill', fill)
  }
  // Add classnames
  const olFill = svg.querySelectorAll('[fill="#0b0c0c" i], [style*="fill:#0b0c0c" i]')
  const olStroke = svg.querySelectorAll('[stroke="#0b0c0c" i], [style*="stroke:#0b0c0c" i]')
  olFill.forEach(n => n.classList.add('fm-c-symbol__ol-fill'))
  olStroke.forEach(n => n.classList.add('fm-c-symbol__ol-stroke'))
  const bgFill = svg.querySelectorAll('[fill="#fff" i], [fill="#ffffff" i], [style*="fill:#fff" i], [style*="fill:#ffffff" i]')
  const bgStroke = svg.querySelectorAll('[stroke*="#fff" i], [stroke*="#ffffff" i], [style*="stroke:#fff" i], [style*="stroke:#ffffff" i]')
  bgFill.forEach(n => n.classList.add('fm-c-symbol__bg-fill'))
  bgStroke.forEach(n => n.classList.add('fm-c-symbol__bg-stroke'))
  const fgFill = svg.querySelectorAll(':not(.fm-c-symbol__ol-fill):not(.fm-c-symbol__bg-fill)[fill], :not(.fm-c-symbol__ol-fill):not(.fm-c-symbol__bg-fill)[style*="fill"]')
  const fgStroke = svg.querySelectorAll(':not(.fm-c-symbol__ol-stroke):not(.fm-c-symbol__bg-stroke)[stroke], :not(.fm-c-symbol__ol-stroke):not(.fm-c-symbol__bg-stroke)[style*="stroke"]')
  fgFill.forEach(n => n.classList.add('fm-c-symbol__fg-fill'))
  fgStroke.forEach(n => n.classList.add('fm-c-symbol__fg-stroke'))
  return dom.body.innerHTML
}
