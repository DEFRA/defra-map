import '../scss/main.scss'
import historyManager from './historyManager.js'
import { parseDataProperties } from './parseDataProperties.js'
import { checkDeviceSupport } from './deviceChecker.js'
import { createButton } from './buttonManager.js'
import { setupBehavior, shouldLoadComponent } from './behaviourController.js'
import { updateDOMState, removeLoadingState } from './domStateManager.js'
import { renderError } from './renderError.js'
import { sanitiseConfig } from '../config/sanitiseConfig.js'
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

  // EventBus methods
  on (...args) {
    eventBus.on(...args)
  }

  off (...args) {
    eventBus.off(...args)
  }

  emit (...args) {
    eventBus.emit(...args)
  }

  _buildConfig (props) {
    const parsedDataset = parseDataProperties(this.rootEl)
    return sanitiseConfig({
      id: this.id,
      title: document.title,
      ...parsedDataset,
      ...props
    })
  }

  _initialize () {
    if (['buttonFirst', 'hybrid'].includes(this.config.behaviour)) {
      this._openButton = createButton(this.config, this.rootEl, () => {
        this._handleButtonClick()
      })
    }

    setupBehavior(this)

    if (shouldLoadComponent(this.config)) {
      this.loadComponent()
    } else {
      removeLoadingState()
    }
  }

  _handleButtonClick () {
    this.loadComponent()
  }

  async loadComponent () {
    if (this._openButton) {
      this._openButton.style.display = 'none'
    }

    try {
      const { initialiseApp } = await import(/* webpackChunkName: "dm-core" */ '../App/initialiseApp.js')
      const [MapProvider, mapFramework] = await this.config.mapProvider.load()

      // Initialise reverseGeocode service if provided
      if (this.config.reverseGeocode) {
        createReverseGeocode(
          this.config.reverseGeocode.provider,
          this.config.reverseGeocode.transformRequest,
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
        mapFramework
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

  removeComponent () {
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
}
