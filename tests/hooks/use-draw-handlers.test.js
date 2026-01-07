import { useDrawHandlers } from '../../src/js/hooks/use-draw-handlers'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import { events } from '../../src/js/store/constants'
import eventBus from '../../src/js/lib/eventbus'

jest.mock('../../src/js/lib/eventbus')
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

eventBus.dispatch = jest.fn()
const dispatch = jest.fn()
const viewportDispatch = jest.fn()
const size = 'TEST SIZE'
const style = 'TEST STYLE'
const parent = 'TEST PARENT'
const segments = 'TEST SEGMENTS'
const layers = []

describe('useDrawHandlers', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    jest.mocked(useViewport).mockReturnValue({ dispatch: viewportDispatch, size, style })
  })

  describe('when provider.map is not set', () => {
    jest.mocked(useApp).mockReturnValue({ provider: {}, dispatch })
    jest.mocked(useViewport).mockReturnValue({ dispatch: viewportDispatch, size, style })

    const { handleAddClick, handleEditClick, handleDeleteClick } = useDrawHandlers()
    it('handleAddClick should return undefined', async () => expect(await handleAddClick({})).toBeUndefined())
    it('handleEditClick should return undefined', async () => expect(await handleEditClick({})).toBeUndefined())
    it('handleDeleteClick should return undefined', async () => expect(await handleDeleteClick({})).toBeUndefined())
  })

  const tests = [
    ['find returns vertex', { drawMode: 'vertex' }],
    ['find returns nothing', undefined]
  ]
  tests.forEach(([description, findResponse]) => {
    const drawTools = { find: () => findResponse }
    const drawMode = findResponse?.drawMode || 'frame'
    describe(`when provider.map is set and ${description}`, () => {
      const styles = ''
      const minZoom = 1
      const maxZoom = 10
      const map = true
      const shapeId = 'polygon'
      const interfaceType = 'test'
      const query = 'MOCK QUERY'
      const queryArea = { styles, minZoom, maxZoom }
      const activeRef = {}
      const viewportRef = {
        current: {
          focus: jest.fn()
        }
      }

      const provider = {
        map,
        query,
        initDraw: jest.fn(),
        draw: {
          edit: jest.fn(),
          add: jest.fn(),
          delete: jest.fn()
        }

      }

      describe('handleAddClick', () => {
        let callback
        beforeEach(async () => {
          jest.mocked(useApp).mockReturnValue({ provider, parent, queryArea, segments, layers, dispatch, query, drawTools, activeRef, viewportRef })
          const { handleAddClick } = useDrawHandlers()
          await handleAddClick({ shapeId, interfaceType })
          callback = provider.initDraw.mock.calls[0][1]
        })

        it('should call provider.initDraw', async () => {
          expect(provider.initDraw).toHaveBeenCalled()
        })

        it('should call provider.initDraw with expected params', async () => {
          expect(provider.initDraw.mock.calls[0][0]).toEqual({ ...queryArea, styles, minZoom, maxZoom, shapeId, interfaceType, drawMode })
        })

        describe('handleAddClick callback', () => {
          it('should pass a callback to provider.initDraw', async () => {
            expect(typeof callback).toEqual('function')
          })
          it('should call draw add and dispatch messages when callback is called', async () => {
            callback()
            expect(dispatch).toHaveBeenCalledWith({ type: 'SET_MODE', payload: { value: drawMode, shape: shapeId, query } })
            expect(viewportDispatch).toHaveBeenCalledWith({ type: 'SWAP_STYLES', payload: { styles, minZoom, maxZoom } })
            expect(eventBus.dispatch).toHaveBeenCalledWith(parent, events.APP_CHANGE, { type: 'drawMode', drawMode, style, size, segments, layers })
          })
        })
      })

      describe('handleEditClick', () => {
        beforeEach(async () => {
          jest.mocked(useApp).mockReturnValue({ provider, parent, queryArea, segments, layers, dispatch, query, drawTools, activeRef, viewportRef })
          const { handleEditClick } = useDrawHandlers()
          await handleEditClick({ shapeId, interfaceType })
        })

        it('should call provider.draw.edit', async () => {
          expect(provider.draw.edit).toHaveBeenCalledWith(drawMode, shapeId, interfaceType)
        })

        it('should call dispatch', async () => {
          expect(dispatch).toHaveBeenCalledWith({ type: 'SET_MODE', payload: { value: drawMode, shape: shapeId, query } })
        })

        it('should call viewportDispatch', async () => {
          expect(viewportDispatch).toHaveBeenCalledWith({ type: 'SWAP_STYLES', payload: { styles, minZoom, maxZoom } })
        })

        it('should call eventBus.dispatch', async () => {
          expect(eventBus.dispatch).toHaveBeenCalledWith(parent, events.APP_CHANGE, { type: 'drawMode', drawMode, style, size, segments, layers })
        })
      })

      describe('handleDeleteClick', () => {
        beforeEach(async () => {
          jest.mocked(useApp).mockReturnValue({ provider, parent, dispatch, query, activeRef, viewportRef })
          const { handleDeleteClick } = useDrawHandlers()
          await handleDeleteClick({ shapeId, interfaceType })
        })

        it('should call provider.draw.edit', async () => {
          expect(provider.draw.delete).toHaveBeenCalledWith()
        })

        it('should call dispatch', async () => {
          expect(dispatch).toHaveBeenCalledWith({ type: 'SET_MODE', payload: { value: 'default', query: null } })
        })

        it('should call eventBus.dispatch', async () => {
          expect(eventBus.dispatch).toHaveBeenCalledWith(parent, events.APP_ACTION, { type: 'deletePolygon', query })
        })
      })
    })
  })
})
