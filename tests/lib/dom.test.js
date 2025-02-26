import { toggleInert, updateTitle, findTabStop } from '../../src/js/lib/dom'

describe('lib/dom - updateTitle', () => {
  it('should return the document title without page', () => {
    document.title = '(Test title) from test'

    updateTitle()

    expect(window.document.title).toEqual('from test')
  })

  it('should return the document title with the page', () => {
    document.title = '(Test title) from test'

    const div = document.createElement('div')
    div.setAttribute('data-fm-page', 'Unit')
    document.body.appendChild(div)

    updateTitle()

    expect(window.document.title).toEqual('(Unit) from test')
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
