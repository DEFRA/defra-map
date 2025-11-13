class EventBus {
  constructor () {
    this.events = {}
  }

  on (eventName, handler) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(handler)
    return this
  }

  off (eventName, handler) {
    if (!this.events[eventName]) {
      return this
    }
    if (handler) {
      this.events[eventName] = this.events[eventName].filter(h => h !== handler)
    } else {
      this.events[eventName] = []
    }
    return this
  }

  emit (eventName, ...args) {
    if (!this.events[eventName]) {
      return this
    }

    this.events[eventName].forEach(handler => {
      try {
        handler(...args)
      } catch (error) {
        console.error(`Error in event handler for '${eventName}':`, error)
      }
    })
    return this
  }

  destroy () {
    this.events = {}
  }
}

// Create singleton instance
const eventBus = new EventBus()

// Export singleton
export default eventBus
