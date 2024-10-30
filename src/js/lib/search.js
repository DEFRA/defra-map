export const createMessage = (suggestions, selected) => {
  let message = suggestions?.length
    ? `${suggestions.length} result${suggestions.length !== 0 ? 's' : ''} are available.`
    : 'No results are available.'
  message += suggestions?.length && selected >= 0
    ? ` ${suggestions[selected].text}. ${selected + 1} of ${suggestions.length} is highlighted.`
    : ''
  return message
}
