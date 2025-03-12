import eventBus from '../../src/js/lib/eventbus'

describe('eventBus', () => {
  let element
  let callback

  beforeEach(() => {
    element = document.createElement('div')
    callback = jest.fn()
  })

  afterEach(() => {
    callback.mockClear()
  })

  describe('on', () => {
    it('should register an event listener that receives event data', () => {
      eventBus.on(element, 'test-event', callback)

      const testData = { message: 'hello' }
      element.dispatchEvent(new CustomEvent('test-event', { detail: testData }))

      expect(callback).toHaveBeenCalledWith(testData)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('dispatch', () => {
    it('should dispatch a CustomEvent with the provided data', () => {
      const listener = jest.fn()
      element.addEventListener('test-event', (e) => listener(e.detail))

      const testData = { message: 'hello' }
      eventBus.dispatch(element, 'test-event', testData)

      expect(listener).toHaveBeenCalledWith(testData)
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('remove', () => {
    it('should remove the event listener', () => {
      const wrappedCallback = (e) => callback(e.detail)
      element.addEventListener('test-event', wrappedCallback)

      eventBus.dispatch(element, 'test-event', { message: 'first' })
      expect(callback).toHaveBeenCalledTimes(1)

      element.removeEventListener('test-event', wrappedCallback)

      eventBus.dispatch(element, 'test-event', { message: 'second' })
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })
})
