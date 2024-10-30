export const locationMarkerHTML = () => {
  const el = document.createElement('div')
  el.className = 'fm-c-marker fm-c-marker--location'
  el.innerHTML = '<div class="fm-c-marker__inner"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8" stroke="#fff" stroke-width="3"/></svg></div>'
  return el
}

export const targetMarkerHTML = () => {
  const el = document.createElement('div')
  el.className = 'fm-c-marker fm-c-marker--target'
  el.innerHTML = '<div class="fm-c-marker__inner"><svg width="69" height="69" viewBox="0 0 69 69" fill-rule="evenodd" fill="none" stroke="currentColor"><circle cx="34.5" cy="34.5" r="33" stroke-width="2"/><path d="M1.5 34.5H31m3.5-33V31m0 36.5V38m33-3.5H38"/></svg></div>'
  return el
}
