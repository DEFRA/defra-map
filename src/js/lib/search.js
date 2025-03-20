export const createMessage = (suggestions, selected) => {
  let message = 'No results are available.'

  message = suggestions?.length ? `${suggestions?.length} results are available.` : message

  const isHighlighted = suggestions?.length && selected >= 0

  message = isHighlighted ? `${suggestions[selected].text}. ${selected + 1} of ${suggestions?.length} is highlighted.` : message

  return message
}
