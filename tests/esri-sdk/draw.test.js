import { Draw } from '../../src/js/provider/esri-sdk/draw'

jest.mock('@arcgis/core/Graphic', () => {
  return jest.fn().mockImplementation(() => ({
    clone: jest.fn().mockReturnValue({
      symbol: {},
      geometry: { rings: [[[0, 0], [1, 1], [2, 2]]] }
    })
  }))
})

jest.mock('@arcgis/core/widgets/Sketch/SketchViewModel.js', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    update: jest.fn(),
    complete: jest.fn(),
    cancel: jest.fn(),
    activeTool: null
  }))
})

describe('Draw Class', () => {
  let mockProvider, drawInstance

  beforeEach(() => {
    mockProvider = {
      draw: null,
      view: { goTo: jest.fn(), zoom: 10 },
      graphicsLayer: { graphics: { items: [] }, removeAll: jest.fn(), add: jest.fn() },
      map: { reorder: jest.fn() }
    }
  })

  it('should initialize Draw with provider reference', () => {
    drawInstance = new Draw(mockProvider, {})
    expect(mockProvider.draw).toBe(drawInstance)
  })

  it('should call create() if a feature is provided', () => {
    const feature = { geometry: { coordinates: [[[0, 0], [1, 1], [2, 2]]] } }
    const createSpy = jest.spyOn(Draw.prototype, 'create')
    drawInstance = new Draw(mockProvider, { feature })
    expect(createSpy).toHaveBeenCalledWith(feature)
    createSpy.mockRestore()
  })

  it('should call start("frame") if no feature is provided', () => {
    const startSpy = jest.spyOn(Draw.prototype, 'start')
    drawInstance = new Draw(mockProvider, {})
    expect(startSpy).toHaveBeenCalledWith('frame')
    startSpy.mockRestore()
  })

  it('should zoom to existing graphic if oGraphic exists in start()', () => {
    drawInstance = new Draw(mockProvider, {})
    drawInstance.oGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
    drawInstance.start('default')
    expect(mockProvider.view.goTo).toHaveBeenCalledWith({ target: drawInstance.oGraphic })
  })

  it('should remove all graphics if mode is "frame" in start()', () => {
    drawInstance = new Draw(mockProvider, {})
    drawInstance.start('frame')
    expect(mockProvider.graphicsLayer.removeAll).toHaveBeenCalled()
  })

  it('should call editGraphic() when mode is not "frame" in start()', () => {
    const editGraphicSpy = jest.spyOn(Draw.prototype, 'editGraphic')
    drawInstance = new Draw(mockProvider, {})
    drawInstance.oGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
    drawInstance.start('default')
    expect(editGraphicSpy).toHaveBeenCalledWith(drawInstance.oGraphic)
    editGraphicSpy.mockRestore()
  })
})
