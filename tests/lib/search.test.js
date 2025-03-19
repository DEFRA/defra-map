import { createMessage } from '../../src/js/lib/search'

describe('lib/search', () => {
  it('should output message based on suggestions', () => {
    const singular = createMessage()
    const plural = createMessage([{ text: 'london' }], -1)

    expect(singular).toEqual('No results are available.')
    expect(plural).toEqual('1 results are available.')
  })

  it('should add highlight in message', () => {
    const message = createMessage([{ text: 'london' }], 0)

    expect(message).toEqual('london. 1 of 1 is highlighted.')
  })
})
