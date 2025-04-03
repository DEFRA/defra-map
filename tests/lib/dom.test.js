import { toggleInert, updateTitle, findTabStop, setInitialFocus, constrainFocus } from '../../src/js/lib/dom'

describe('lib/dom - updateTitle', () => {
  it('should return the document title without page', () => {
    document.title = 'Test title - from test'

    updateTitle()

    expect(window.document.title).toEqual('from test')
  })

  it('should return the document title with the page', () => {
    document.title = 'Test title - from test'

    const div = document.createElement('div')
    div.setAttribute('data-fm-page', 'Unit')
    document.body.appendChild(div)

    updateTitle()

    expect(window.document.title).toEqual('Unit - from test')
  })
})

describe('lib/dom - toggleInert', () => {
  it('should remove inert attributes', () => {
    document.body.innerHTML = `
      <div data-fm-inert>inert</div>
      <div data-fm-inert aria-hidden>aria</div>
    `

    toggleInert()

    expect(document.querySelectorAll('[data-fm-inert]').length).toEqual(0)
  })

  it('should add inert attributes', () => {
    document.body.innerHTML = `
      <div data-fm-page>
        <div aria-modal="true" open>
          <p>sibling</p>
        </div>

        <div data-fm-inert>inert</div>
        <div data-fm-inert aria-hidden>aria</div>
      </div>
    `

    toggleInert()

    expect(document.querySelectorAll('[data-fm-inert]').length).toEqual(0)
  })

  it('should add aria-hidden and data-fm-inert attributes to siblings', () => {
    // Set up a minimal DOM structure that would trigger the inert behavior
    document.body.innerHTML = `
      <div data-fm-page>
        <div aria-modal="true" open id="modal">Modal content</div>
        <div id="sibling1">Sibling 1</div>
        <div id="sibling2">Sibling 2</div>
      </div>
    `

    // Mock document.activeElement to point to the modal
    Object.defineProperty(document, 'activeElement', {
      value: document.getElementById('modal'),
      writable: true
    })

    // Call toggleInert
    toggleInert()

    // Check that siblings got the inert attributes
    expect(document.getElementById('sibling1').getAttribute('aria-hidden')).toBe('true')
    expect(document.getElementById('sibling1').getAttribute('data-fm-inert')).toBe('')
    expect(document.getElementById('sibling2').getAttribute('aria-hidden')).toBe('true')
    expect(document.getElementById('sibling2').getAttribute('data-fm-inert')).toBe('')
  })
})

describe('lib/dom - findTabStop', () => {
  it('should return the next element in the list', () => {
    document.body.innerHTML = `
      <input type="text" />
      <button type="submit">button</button
      <textarea></texarea>
      <a href="/">link</a>
      <select></select>
    `

    const el = findTabStop(document.querySelector('input'), 'next')

    expect(el).toEqual(document.querySelector('button'))
  })

  it('should return the first element in the list', () => {
    document.body.innerHTML = `
      <input type="text" />
      <button type="submit">button</button
      <textarea></texarea>
      <a href="/">link</a>
      <select></select>
    `

    const el = findTabStop(document.querySelector('select'), 'next')

    expect(el).toEqual(document.querySelector('input'))
  })
})

describe('lib/dom - setInitialFocus', () => {
  it('should focus on modal when active element is not within modal', () => {
    document.body.innerHTML = `
      <div data-fm-page>
        <div id="outsideElement">Outside Element</div>
        <div aria-modal="true" open id="modal">Modal Content</div>
      </div>
    `

    const modalEl = document.getElementById('modal')
    const outsideEl = document.getElementById('outsideElement')
    outsideEl.focus()

    const focusSpy = jest.spyOn(modalEl, 'focus')

    setInitialFocus()

    expect(focusSpy).toHaveBeenCalled()
    focusSpy.mockRestore()
  })

  it('should focus on viewport when active element is not within container', () => {
    document.body.innerHTML = `
      <div data-fm-page>
        <div id="outsideElement">Outside Element</div>
        <div data-fm-viewport id="viewport">Viewport</div>
      </div>
    `

    const viewportEl = document.getElementById('viewport')

    document.body.focus()

    const focusSpy = jest.spyOn(viewportEl, 'focus')

    setInitialFocus()

    expect(focusSpy).toHaveBeenCalled()
    focusSpy.mockRestore()
  })

  it('should not focus anything if no modal or viewport is found', () => {
    document.body.innerHTML = `
      <div>
        <div id="someElement">Some Element</div>
      </div>
    `

    document.body.focus()

    setInitialFocus()
  })
})

describe('lib/dom - constrainFocus', () => {
  it('should do nothing if key is not Tab', () => {
    const event = { key: 'Enter', preventDefault: jest.fn() }
    constrainFocus(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('should do nothing if active element is not in modal or page', () => {
    document.body.innerHTML = `
      <div id="outsideElement">Outside Element</div>
    `

    const outsideEl = document.getElementById('outsideElement')
    outsideEl.focus()

    const event = { key: 'Tab', preventDefault: jest.fn() }
    constrainFocus(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('should not trap focus when tabbing forward from a non-last element', () => {
    document.body.innerHTML = `
      <div aria-modal="true" open>
        <button id="first">First</button>
        <button id="middle">Middle</button>
        <button id="last">Last</button>
      </div>
    `

    const middleEl = document.getElementById('middle')
    middleEl.focus()

    const event = { key: 'Tab', shiftKey: false, preventDefault: jest.fn() }
    constrainFocus(event)

    expect(event.preventDefault).not.toHaveBeenCalled()
  })
})
