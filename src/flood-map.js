import { events, settings } from './js/store/constants.js'
import { capabilities } from './js/lib/capabilities.js'
import { parseAttribute } from './js/lib/utils.js'
import { setInitialFocus, updateTitle, toggleInert } from './js/lib/dom.js'
import eventBus from './js/lib/eventbus.js'
// Polyfills
import 'event-target-polyfill'

const { location, history } = window
const cssFocusVisible = 'fm-u-focus-visible'
const device = framework => capabilities[framework || 'default'].getDevice()

export class FloodMap extends EventTarget {
  _search
  _info
  _selected
  _draw
  
  constructor (id, props) {
    super()
    this.el = document.getElementById(id)

    // Check capabilities
    const { isSupported, error } = device(props.framework)
    if (!isSupported) {
      this.el.insertAdjacentHTML('beforebegin', `
        <div class="fm-error">
          <p class="govuk-body">Your device is not supported. A map is available with a more up-to-date browser or device.</p>
        </div>
      `)
      // Remove hidden class
      document.body.classList.remove('fm-js-hidden')
      // Log error message
      error && console.log(error)
      return
    }

    // Merge props
    const dataset = { ...this.el.dataset }
    Object.keys(dataset).forEach(key => { dataset[key] = parseAttribute(dataset[key]) })
    const parent = document.getElementById(dataset.target || props.target || id)
    const options = { id, parent, title: document.title, ...props, ...dataset }
    this.props = options
    this.id = id
    this.root = null

    // Get visibility
    const { type, maxMobile } = options
    const mobileMQ = `(max-width: ${maxMobile || settings.breakpoints.MAX_MOBILE})`
    this.searchParams = new URLSearchParams(document.location.search)
    this.isMobile = window?.matchMedia(mobileMQ).matches
    this.isVisible = this.searchParams.get('view') === id || type === 'inline' || (type === 'hybrid' && !this.isMobile)

    // Add app
    if (this.isVisible) { this._importComponent() }

    // Add button
    this._insertButtonHTML()

    // Exit map
    this.props.handleExit = this._handleExit.bind(this)

    // History change add/remove app
    window.addEventListener('popstate', this._handlePopstate.bind(this))

    // Responsive add/remove app
    window.matchMedia(mobileMQ).addEventListener('change', this._handleMobileMQ.bind(this))

    // Set initial focus
    window.addEventListener('focus', () => { setInitialFocus() })

    // Set isKeyboard
    window.addEventListener('keydown', this._handleKeydown.bind(this), true)

    // Unset isKeyboard
    window.addEventListener('pointerdown', this._handlePointerdown.bind(this))
    window.addEventListener('wheel', this._handlePointerdown.bind(this))

    // Polyfil :focus-visible set
    const handleFocusIn = () => {
      if (!this.isKeyboard) {
        return
      }
      document.activeElement.classList.add(cssFocusVisible)
    }
    window.addEventListener('focusin', handleFocusIn)

    // Polyfil :focus-visible remove
    const handleFocusOut = e => { e.target.classList.remove(cssFocusVisible) }
    window.addEventListener('focusout', handleFocusOut)

    // Component ready
    eventBus.on(parent, events.APP_READY, data => {
      this.map = data.map
      this.modules = data.modules
      this.isReady = true
      eventBus.dispatch(this.props.parent, events.SET_IS_KEYBOARD, this.isKeyboard || false)
      // We now have a reference to the map
      eventBus.dispatch(this, events.READY, { type: 'ready', ...data })
      // Need to call these after the component is ready
      if (this._info) {
        eventBus.dispatch(this.props.parent, events.SET_INFO, this._info)
      }
      if (this._selected) {
        eventBus.dispatch(this.props.parent, events.SET_SELECTED, this._selected)
      }
      if (this._draw) {
        eventBus.dispatch(this.props.parent, events.SET_DRAW, this._draw)
      }
    })

    // Change, eg segment, layer or style
    eventBus.on(parent, events.APP_CHANGE, data => {
      eventBus.dispatch(this, events.CHANGE, data)
    })

    // Query, eg Click or keyboard
    eventBus.on(parent, events.APP_QUERY, data => {
      eventBus.dispatch(this, events.QUERY, data)
    })
  }

  _insertButtonHTML () {
    const { buttonText, buttonType } = this.props
    this.el.insertAdjacentHTML('beforebegin', `
      <a href="${location.pathname}?view=${this.id}" class="${(buttonType === 'anchor' ? 'fm-c-btn-open-map-anchor' : 'fm-c-btn-open-map')} govuk-body-s" ${this.isVisible ? 'style="display:none"' : ''} role="button">
          <svg focusable='false' aria-hidden='true' width='16' height='20' viewBox='0 0 16 20' fillRule='evenodd'><path d='M15 7.5c.009 3.778-4.229 9.665-7.5 12.5C4.229 17.165-.009 11.278 0 7.5a7.5 7.5 0 1 1 15 0z'/><path d='M7.5 12.961a5.46 5.46 0 1 0 0-10.922 5.46 5.46 0 1 0 0 10.922z' fill='#fff'/></svg><span>${buttonText || 'Map view'}</span>
          <span class='fm-u-visually-hidden'>(Visual only)</span>
      </a>
    `)
    const button = this.el.previousElementSibling
    button.addEventListener('click', this._handleClick.bind(this))
    this.button = button
    // Remove hidden class
    document.body.classList.remove('fm-js-hidden')
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
    this.isMobile = e.matches
    const { type } = this.props
    const hasViewParam = (new URLSearchParams(document.location.search)).get('view') === this.id
    this.isVisible = (hasViewParam || type === 'inline' || (type === 'hybrid' && !this.isMobile))
    if (this.isVisible) {
      this._importComponent()
    } else {
      this._removeComponent()
    }
  }

  _handlePopstate () {
    const { type } = this.props
    if (history.state?.isBack) {
      this._importComponent()
    } else if (type === 'buttonFirst' || (type === 'hybrid' && this.isMobile)) {
      this._removeComponent()
    } else {
      // No action
    }
  }

  _handleKeydown (e) {
    if (e.key !== 'Tab') {
      return
    }
    this.isKeyboard = true
    eventBus.dispatch(this.props.parent, events.SET_IS_KEYBOARD, true)
  }

  _handlePointerdown () {
    eventBus.dispatch(this.props.parent, events.SET_IS_KEYBOARD, false)
    document.activeElement.classList.remove(cssFocusVisible)
    this.isKeyboard = false
  }

  _importComponent () {
    import(/* webpackChunkName: "flood-map-ui" */ './root.js').then(module => {
      this._addComponent(module)
    })
  }

  _addComponent (module) {
    if (this.root) {
      return
    }
    this.button.setAttribute('style', 'display: none')
    this.root = module.default(this.el, { ...this.props, isKeyboard: this.isKeyboard })
  }

  _removeComponent () {
    this.button.removeAttribute('style')
    this.button.removeAttribute('data-open')
    this.button.focus()
    this.root?.unmount()
    this.root = null
    this._selected = null
    this._info = null
    updateTitle()
    toggleInert()
  }

  get info () {
    return this._info
  }

  set info (value) {
    this._info = value
    if (!this.isReady) {
      return
    }
    eventBus.dispatch(this.props.parent, events.SET_INFO, this._info)
  }

  get select () {
    return this._selected
  }

  set select (value) {
    this._selected = value
    if (!this.isReady) {
      return
    }
    eventBus.dispatch(this.props.parent, events.SET_SELECTED, this._selected)
  }

  get draw () {
    return this._draw
  }

  set draw (value) {
    this._draw = value
    if (!this.isReady) {
      return
    }
    eventBus.dispatch(this.props.parent, events.SET_DRAW, this._draw)
  }
}
