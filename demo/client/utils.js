export const getCookie = (name) => {
  const r = document.cookie.match('\\b' + name + '=([^;]*)\\b')
  return r ? r[1] : null
}

export const getQueryParam = (name) => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}
