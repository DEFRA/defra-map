export const createMessage = (suggestions, selected) => {
  const results = `${suggestions?.length} result${suggestions?.length !== 0 ? 's' : ''} are available.`
  let message = suggestions?.length ? results : 'No results are available.'
  const isHighlighted = suggestions?.length && selected >= 0
  message = isHighlighted ? `${suggestions[selected].text}. ${selected + 1} of ${suggestions?.length} is highlighted.` : message
  return message
}
