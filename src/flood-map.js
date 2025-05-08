import { events, settings } from './js/store/constants.js'
import { capabilities } from './js/lib/capabilities.js'
import { parseAttribute } from './js/lib/utils.js'
import { setInitialFocus, updateTitle, toggleInert } from './js/lib/dom.js'
import eventBus from './js/lib/eventbus.js'
// Polyfills
import 'event-target-polyfill'

const { location, history } = window
const cssFocusVisible = 'fm-u-focus-visible'

export class FloodMap extends EventTarget {
  _search
  _info
  _selected
  _banner

  constructor (id, props, callBack) {
    super()
    this.el = document.getElementById(id)

    // Check capabilities
    props.framework ??= 'default'
    const device = this._testDevice(props)

    if (!device.isSupported) {
      this._renderError('Your device is not supported. A map is available with a more up-to-date browser or device.')
      // Remove hidden class
      document.body.classList.remove('fm-js-hidden')
      // Add error flag to body
      document.body.setAttribute('data-fm-error', '')
      // Log error message
      device.error && console.log(device.error)
      return
    }

    // Merge props
    const dataset = { ...this.el?.dataset }
    Object.keys(dataset).forEach(key => { dataset[key] = parseAttribute(dataset[key]) })
    const parent = document.getElementById(dataset?.container || props?.container || id)
    const options = { id, parent, title: document.title, ...props, ...dataset }
    this.props = options
    this.callBack = callBack
    this.id = id
    this.root = null

    // Get visibility
    const { maxMobile } = options
    const mobileMQ = window.matchMedia(`(max-width: ${maxMobile || settings.breakpoints.MAX_MOBILE})`)
    this.searchParams = new URLSearchParams(document.location.search)

    // Set isMobile and isVisible
    this._handleMobileMQ(mobileMQ)

    // Add container
    if (this.isVisible) {
      this._importComponent()
    }

    // Add button
    if (['buttonFirst', 'hybrid'].includes(props?.behaviour)) {
      this._insertButtonHTML()
      // Remove hidden class
      if (!this.isVisible) {
        document.body.classList.remove('fm-js-hidden')
      }
    }

    // Exit map
    this.props.handleExit = this._handleExit.bind(this)

    // Responsive change add/remove app
    mobileMQ.addEventListener('change', () => {
      this._handleMobileMQ(mobileMQ)
      this.isVisible ? this._importComponent() : this._removeComponent()
    })

    // History change add/remove app
    window.addEventListener('popstate', this._handlePopstate.bind(this))

    // Set initial focus
    window.addEventListener('focus', () => { setInitialFocus() })

    // Set keyboard interfaceType
    window.addEventListener('keydown', this._handleKeydown.bind(this), true)

    // Set touch interfaceType
    window.addEventListener('touchstart', this._handleTouchstart.bind(this), true)

    // Unset interfaceType
    window.addEventListener('pointerdown', this._handlePointerdown.bind(this))
    window.addEventListener('wheel', this._handlePointerdown.bind(this))

    // Polyfil :focus-visible set
    const handleFocusIn = () => {
      if (this.interfaceType === 'keyboard') {
        document.activeElement.classList.add(cssFocusVisible)
      }
    }
    window.addEventListener('focusin', handleFocusIn)

    // Polyfil :focus-visible remove
    const handleFocusOut = e => { e.target.classList.remove(cssFocusVisible) }
    window.addEventListener('focusout', handleFocusOut)

    // Component ready
    eventBus.on(parent, events.APP_READY, data => {
      Object.assign(this, data.framework)
      this.modules = data.modules
      this.isReady = true
      eventBus.dispatch(this.props.parent, events.SET_INTERFACE_TYPE, this.interfaceType)
      // We now have a reference to the map
      eventBus.dispatch(this, events.READY, { type: 'ready', ...data })
      // Need to call these after the component is ready
      if (this._info) { eventBus.dispatch(this.props.parent, events.SET_INFO, this._info) }
      if (this._selected) { eventBus.dispatch(this.props.parent, events.SET_SELECTED, this._selected) }
      if (this._banner) { eventBus.dispatch(this.props.parent, events.SET_BANNER, this._banner) }
    })

    // Change, eg segment, layer or style
    eventBus.on(parent, events.APP_CHANGE, data => { eventBus.dispatch(this, events.CHANGE, data) })

    // Query, eg Click or keyboard
    eventBus.on(parent, events.APP_QUERY, data => { eventBus.dispatch(this, events.QUERY, data) })

    // Action, eg delete a polygon or confirm update
    eventBus.on(parent, events.APP_ACTION, data => { eventBus.dispatch(this, events.ACTION, data) })
  }

  _testDevice (props) {
    const device = framework => capabilities[framework].getDevice()
    const { isSupported, error } = device(props.framework)
    const isImplementationSupported = props?.deviceTestCallback ? props.deviceTestCallback() : true
    return {
      isSupported: isSupported && isImplementationSupported,
      error
    }
  }

  _renderError (text) {
    this.el.insertAdjacentHTML('beforebegin', `
      <div class="fm-error">
        <p class="fm-error__body">${text}</p>
      </div>
    `)
  }

  _insertButtonHTML () {
    const { buttonText, buttonType } = this.props
    this.el.insertAdjacentHTML('beforebegin', `
      <a href="${location.pathname}?view=${this.id}" class="${(buttonType === 'anchor' ? 'fm-c-btn-hyperlink' : 'fm-c-btn-tertiary')}" ${this.isVisible ? 'style="display:none"' : ''} role="button">
          <svg focusable='false' aria-hidden='true' width='16' height='20' viewBox='0 0 16 20' fillRule='evenodd'><path d='M15 7.5c.009 3.778-4.229 9.665-7.5 12.5C4.229 17.165-.009 11.278 0 7.5a7.5 7.5 0 1 1 15 0z'/><path d='M7.5 12.961a5.46 5.46 0 1 0 0-10.922 5.46 5.46 0 1 0 0 10.922z' fill='#fff'/></svg><span>${buttonText || 'Map view'}</span>
          <span class='fm-u-visually-hidden'>(Visual only)</span>
      </a>
    `)
    const button = this.el.previousElementSibling
    button.addEventListener('click', this._handleClick.bind(this))
    this.button = button
  }

  _handleExit () {
    if (history.state?.isBack) {
      history.back()
      return
    }
    this._removeComponent()
    Object.keys(settings.params).forEach(k => this.searchParams.delete(settings.params[k]))
    const url = location.pathname + this.searchParams.toString()
    history.replaceState({ isBack: false }, '', url)
  }

  _handleClick (e) {
    e.preventDefault()
    history.pushState({ isBack: true }, '', `${e.target.getAttribute('href')}`)
    this.button.setAttribute('data-fm-open', '')
    this._importComponent()
  }

  _handleMobileMQ (e) {
    const { behaviour } = this.props
    const hasViewParam = (new URLSearchParams(document.location.search)).get('view') === this.id
    this.isMobile = e.matches
    this.isVisible = hasViewParam || behaviour === 'inline' || (behaviour === 'hybrid' && !e.matches)
  }

  _handlePopstate () {
    const { behaviour } = this.props
    const hasButton = behaviour === 'buttonFirst' || (behaviour === 'hybrid' && this.isMobile)
    if (history.state?.isBack) {
      this._importComponent()
    } else if (hasButton) {
      this._removeComponent()
    } else {
      // No action
    }
  }

  _handleKeydown (event) {
    if (event.key === 'Tab') {
      this.interfaceType = 'keyboard'
      eventBus.dispatch(this.props.parent, events.SET_INTERFACE_TYPE, 'keyboard')
    }
  }

  _handleTouchstart () {
    this.interfaceType = 'touch'
    eventBus.dispatch(this.props.parent, events.SET_INTERFACE_TYPE, 'touch')
  }

  _handlePointerdown () {
    eventBus.dispatch(this.props.parent, events.SET_INTERFACE_TYPE, null)
    document.activeElement.classList.remove(cssFocusVisible)
    this.interfaceType = null
  }

  async _importComponent () {
    this.button?.setAttribute('style', 'display: none')
    const isLoaded = !!this.isLoaded

    // Add loading spinner

    // Load custom map provider
    if (!isLoaded && this.props.provider) {
      this.props.provider = await this.props.provider()
    }

    // Load default map provider
    if (!isLoaded && !this.props.provider) {
      this.props.provider = (await import(/* webpackChunkName: "flood-map-provider" */ './js/provider/os-maplibre/provider.js')).default
    }

    // Load default geocode provider
    if (!isLoaded && !this.props.geocodeProvider) {
      this.props.geocodeProvider = (await import(/* webpackChunkName: "flood-map-provider" */ './js/provider/os-open-names/geocode.js')).default
    }

    // Load default reverse geocode provider
    if (!isLoaded && !this.props.reverseGeocodeProvider) {
      this.props.reverseGeocodeProvider = (await import(/* webpackChunkName: "flood-map-provider" */ './js/provider/os-open-names/reverse-geocode.js')).default
    }

    // All providers loaded
    this.isLoaded = true

    // Load main App
    import(/* webpackChunkName: "flood-map-ui" */ './root.js').then(module => {
      const App = module.default
      this._addComponent(App)
    }).catch(err => {
      // Display error content
      this._renderError('There was a problem loading the map. Please try again later')
      console.log(err)
    })
  }

  _addComponent (root) {
    if (this.root) {
      return
    }
    this.root = root(this.el, { ...this.props, callBack: this.callBack, interfaceType: this.interfaceType })
  }

  _removeComponent () {
    if (this.button) {
      this.button.removeAttribute('style')
      this.button.removeAttribute('data-open')
      this.button.focus()
      this.root?.unmount()
      this.root = null
      this._info = null
      this._selected = null
      this._banner = null
      updateTitle()
      toggleInert()
    }
  }

  // Public methods

  setInfo (value) {
    this._info = value
    if (!this.isReady) {
      return
    }
    eventBus.dispatch(this.props.parent, events.SET_INFO, this._info)
  }

  setSelected (value) {
    this._selected = value
    if (!this.isReady) {
      return
    }
    eventBus.dispatch(this.props.parent, events.SET_SELECTED, this._selected)
  }

  setBanner (value) {
    this._banner = value
    if (!this.isReady) {
      return
    }
    eventBus.dispatch(this.props.parent, events.SET_BANNER, this._banner)
  }
}
