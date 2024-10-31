'use strict'
import { events, settings } from './js/store/constants.js'
import { parseAttribute } from './js/lib/utils.js'
import { setInitialFocus, updateTitle, toggleInert } from './js/lib/dom.js'
import eventBus from './js/lib/eventbus.js'

// Polyfills
import 'event-target-polyfill'

const { location, history } = window

export class FloodMap extends EventTarget {
  _search
  _info
  _selected
  _draw

  constructor (id, props) {
    super()

    // Merge props
    const el = document.getElementById(id)
    const dataset = { ...el.dataset }
    Object.keys(dataset).forEach(key => { dataset[key] = parseAttribute(dataset[key]) })
    const parent = document.getElementById(dataset.target || props.target || id)
    const options = { id, parent, title: document.title, ...props, ...dataset }
    this.props = options
    this.el = el
    this.root = null

    // Get visibility
    const { type, maxMobile, buttonText, buttonType } = options
    const mobileMQ = `(max-width: ${maxMobile || settings.breakpoints.MAX_MOBILE})`
    const searchParams = new URLSearchParams(document.location.search)
    let isMobile = window?.matchMedia(mobileMQ).matches
    let isVisible = searchParams.get('view') === id || type === 'inline' || (type === 'hybrid' && !isMobile)

    // Add app
    if (isVisible) { this._importComponent() }

    // Add button
    el.insertAdjacentHTML('beforebegin', `
            <a href="${location.pathname}?view=${id}" class="${(buttonType === 'anchor' ? 'fm-c-btn-open-map-anchor' : 'fm-c-btn-open-map')} govuk-body-s" ${isVisible ? 'style="display:none"' : ''} role="button">
                <svg focusable='false' aria-hidden='true' width='16' height='20' viewBox='0 0 16 20' fillRule='evenodd'><path d='M15 7.5c.009 3.778-4.229 9.665-7.5 12.5C4.229 17.165-.009 11.278 0 7.5a7.5 7.5 0 1 1 15 0z'/><path d='M7.5 12.961a5.46 5.46 0 1 0 0-10.922 5.46 5.46 0 1 0 0 10.922z' fill='#fff'/></svg><span>${buttonText || 'Map view'}</span>
                <span class='fm-u-visually-hidden'>(Visual only)</span>
            </a>
        `)
    const button = el.previousElementSibling
    this.button = button

    // Exit map
    this.props.handleExit = () => {
      if (history.state?.isBack) {
        history.back()
        return
      }
      this._removeComponent()
      Object.keys(settings.params).forEach(k => searchParams.delete(settings.params[k]))
      const url = location.pathname + searchParams.toString()
      history.replaceState({ isBack: false }, '', url)
    }

    // Button click add app
    button.addEventListener('click', e => {
      e.preventDefault()
      history.pushState({ isBack: true }, '', `${e.target.getAttribute('href')}`)
      button.setAttribute('data-fm-open', '')
      this._importComponent()
    })

    // History change add/remove app
    const handlePopstate = () => {
      if (history.state?.isBack) {
        this._importComponent()
      } else if (type === 'buttonFirst' || (type === 'hybrid' && isMobile)) {
        this._removeComponent()
      } else {
        // No action
      }
    }
    window.addEventListener('popstate', handlePopstate)

    // Responsive add/remove app
    const handleMobileMQ = e => {
      isMobile = e.matches
      const hasViewParam = (new URLSearchParams(document.location.search)).get('view') === id
      isVisible = (hasViewParam || type === 'inline' || (type === 'hybrid' && !isMobile))
      if (isVisible) {
        this._importComponent()
      } else {
        this._removeComponent()
      }
    }
    window.matchMedia(mobileMQ).addEventListener('change', handleMobileMQ)

    // if (window.matchMedia(mobileMQ).addEventListener) {
    //   window.matchMedia(mobileMQ).addEventListener('change', handleMobileMQ)
    // } else {
    //   window.matchMedia(mobileMQ).addListener(handleMobileMQ)
    // }

    // Set initial focus
    window.addEventListener('focus', () => { setInitialFocus() })

    // Set isKeyboard
    const handleKeydown = e => {
      // if (!['Escape', 'Esc', 'Tab'].includes(e.key)) return
      if (e.key !== 'Tab') {
        return
      }
      this.isKeyboard = true
      eventBus.dispatch(this.props.parent, events.SET_IS_KEYBOARD, true)
    }
    window.addEventListener('keydown', handleKeydown, true)

    // Unset isKeyboard
    const handlePointerdown = () => {
      eventBus.dispatch(this.props.parent, events.SET_IS_KEYBOARD, false)
      document.activeElement.classList.remove('fm-u-focus-visible')
      this.isKeyboard = false
    }
    window.addEventListener('pointerdown', handlePointerdown)
    window.addEventListener('wheel', handlePointerdown)

    // Polyfil :focus-visible set
    const handleFocusIn = () => {
      if (!this.isKeyboard) {
        return
      }
      document.activeElement.classList.add('fm-u-focus-visible')
    }
    window.addEventListener('focusin', handleFocusIn)

    // Polyfil :focus-visible remove
    const handleFocusOut = e => { e.target.classList.remove('fm-u-focus-visible') }
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
