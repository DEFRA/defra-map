import '../scss/main.scss'
import historyManager from './historyManager.js'
import { parseDataProperties } from './parseDataProperties.js'
import { checkDeviceSupport } from './deviceChecker.js'
import { createButton } from './buttonManager.js'
import { setupBehavior, shouldLoadComponent } from './behaviourController.js'
import { updateDOMState, removeLoadingState } from './domStateManager.js'
import { renderError } from './renderError.js'
import { mergeConfig } from '../config/mergeConfig.js'
import { createBreakpointDetector, getBreakpoint } from '../utils/detectBreakpoint.js'
import { createInterfaceDetector, getInterfaceType } from '../utils/detectInterfaceType.js'
import { createReverseGeocode } from '../services/reverseGeocode.js'
import eventBus from '../services/eventBus.js'

export default class DefraMap {
  _openButton = null
  _root = null // keep react root internally

  constructor (id, props = {}) {
    this.id = id
    this.rootEl = document.getElementById(id)

    if (!this.rootEl) {
      throw new Error(`Element with id "${id}" not found`)
    }

    this.config = this._buildConfig(props)

    if (!checkDeviceSupport(this.rootEl, this.config)) {
      return
    }

    if (['buttonFirst', 'hybrid'].includes(this.config.behaviour)) {
      historyManager.register(this)
    }

    createBreakpointDetector({
      maxMobileWidth: this.config.maxMobileWidth,
      minDesktopWidth: this.config.minDesktopWidth
    })
    createInterfaceDetector()

    this._initialize()
  }

  _buildConfig (props) {
    const parsedDataset = parseDataProperties(this.rootEl)
    return mergeConfig({
      id: this.id,
      title: document.title,
      ...parsedDataset,
      ...props
    })
  }

  // Private methods
  _initialize () {
    if (['buttonFirst', 'hybrid'].includes(this.config.behaviour)) {
      this._openButton = createButton(this.config, this.rootEl, (e) => {
        this._handleButtonClick(e)
      })
    }

    setupBehavior(this)

    if (shouldLoadComponent(this.config)) {
      this.loadApp()
    } else {
      removeLoadingState()
    }
  }

  _handleButtonClick (e) {
    this.loadApp()
    history.pushState({ isBack: true }, '', e.currentTarget.getAttribute('href'))
  }

  _handleExitClick () {
    this.removeApp()
    // Remove the map param from the URL using regex to prevent encoding
    const key = this.config.mapViewParamKey
    const href = location.href
    const newUrl = href.replace(new RegExp(`[?&]${key}=[^&]*(&|$)`),(_, p1) => (p1 === '&' ? '?' : '')).replace(/\?$/, '')
    history.replaceState(history.state, '', newUrl)
  }

  // Public methods
  async loadApp () {
    if (this._openButton) {
      this._openButton.style.display = 'none'
    }

    try {
      const { initialiseApp } = await import(/* webpackChunkName: "dm-core" */ '../App/initialiseApp.js')
      const [MapProvider, mapFramework] = await this.config.mapProvider.load()

      // Initialise reverseGeocode service if provided
      if (this.config.reverseGeocodeProvider) {
        createReverseGeocode(
          this.config.reverseGeocodeProvider,
          this.config.mapProvider.crs
        )
      }

      // Initialise App
      const appInstance = await initialiseApp(this.rootEl, {
        id: this.id,
        initialBreakpoint: getBreakpoint(),
        initialInterfaceType: getInterfaceType(),
        ...this.config,
        MapProvider,
        mapFramework,
        handleExitClick: this._handleExitClick.bind(this)
      })

      // Merge returned APIs (plugins etc.)
      this._root = appInstance._root
      delete appInstance._root

      // Only assign properties but don't eventBus methods
      const protectedKeys = ['on', 'off', 'emit']

      Object.keys(appInstance).forEach(key => {
        if (!protectedKeys.includes(key)) {
          this[key] = appInstance[key]
        }
      })

      updateDOMState(this)
    } catch (err) {
      renderError(this.rootEl, this.config.genericErrorText)
      console.error(err)
      throw err
    }
  }
 
  removeApp () {
    if (this._root && typeof this.unmount === 'function') {
      this.unmount()
      this._root = null
    }

    if (this._openButton) {
      this._openButton.removeAttribute('style')
      this._openButton.focus()
    }

    updateDOMState(this)
  }

  // API - EventBus methods
  on (...args) {
    eventBus.on(...args)
  }

  off (...args) {
    eventBus.off(...args)
  }

  emit (...args) {
    eventBus.emit(...args)
  }

  // API - location markers
  addMarker (id, coords, options) {
    eventBus.emit('app:addmarker', { id, coords, options })
  }

  removeMarker (id) {
    eventBus.emit('app:removemarker', id)
  }

  // API - change app mode
  setMode (mode) {
    eventBus.emit('app:setmode', mode)
  }

  // Interface API add button/panel/control, remove panel
  addButton (id, config) {
    eventBus.emit('app:addbutton', { id, config })
  }

  addPanel (id, config) {
    eventBus.emit('app:addpanel', { id, config })
  }

  addControl (id, config) {
    eventBus.emit('app:addcontrol', { id, config })
  }

  removePanel (id) {
    eventBus.emit('app:removepanel', id)
  }
}
