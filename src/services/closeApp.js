import { EVENTS as events } from '../config/events.js' 
// import eventBus from '../services/eventBus.js'

export function closeApp (mapId, handleExitClick, eventBus) {
  eventBus.emit(events.MAP_EXIT, { mapId })

  if (history.state?.isBack) {
    history.back()
    return
  }

  handleExitClick()
}