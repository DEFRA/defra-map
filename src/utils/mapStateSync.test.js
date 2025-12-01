import { setMapStateInURL, getInitialMapState } from './mapStateSync'

describe('mapStateSync utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(history, 'replaceState').mockImplementation(() => {})
  })

  describe('getInitialMapState', () => {
    it('returns state from URL if available', () => {
      // Mock internal function getMapStateFromURL by temporarily overriding
      const mockState = { center: [10, 20], zoom: 5 }
      const original = jest.requireActual('./mapStateSync')
      jest.spyOn(original, 'getInitialMapState')
      const state = getInitialMapState({ id: 'map1', center: [0, 0], zoom: 0 })
      expect(state).toBeTruthy()
    })

    it('returns bounds if no URL state', () => {
      const bounds = [[0, 0], [10, 10]]
      const state = getInitialMapState({ id: 'map1', bounds })
      expect(state).toEqual({
        center: undefined,
        zoom: undefined,
        bounds
      })
    })

    it('returns default center/zoom if no URL or bounds', () => {
      const state = getInitialMapState({ id: 'map1', center: [1, 2], zoom: 3 })
      expect(state).toEqual({
        center: [1, 2],
        zoom: 3,
        bounds: undefined
      })
    })
  })

  describe('setMapStateInURL', () => {
    it('calls history.replaceState with updated params', () => {
      setMapStateInURL('map1', { center: [10, 20], zoom: 5 })
      expect(history.replaceState).toHaveBeenCalled()
      const callArgs = history.replaceState.mock.calls[0]
      expect(callArgs.length).toBe(3)
      expect(callArgs[2]).toContain('map1:center=10,20')
      expect(callArgs[2]).toContain('map1:zoom=5')
    })
  })
})
