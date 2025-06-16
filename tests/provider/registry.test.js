import 'jest-canvas-mock'

describe('registry', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should return no support', async () => {
        const { getMapProvider } = await import('../../src/js/provider/registry.js')

        const result = {
            isSupported: false,
            error: 'WebGL is not supported'
        }
        
        const maplibreProvider = getMapProvider('maplibre')
        expect(maplibreProvider.checkSupport()).toEqual(result)

        const esriProvider =  getMapProvider('esri')
        expect(esriProvider.checkSupport()).toEqual(result)
    })

    it('should return webgl suported but disabled', async () => {
        Object.defineProperty(window, 'WebGLRenderingContext', {
            writable: true,
            value: true
        })

        const { getMapProvider } = await import('../../src/js/provider/registry.js')

        const result = {
            isSupported: false,
            error: 'WebGL is supported, but disabled'
        }

        const maplibreProvider = getMapProvider('maplibre')
        expect(maplibreProvider.checkSupport()).toEqual(result)

        const esriProvider =  getMapProvider('esri')
        expect(esriProvider.checkSupport()).toEqual(result)
    })

    it('should return full capabilities', async () => {
        const originalCreateElement = document.createElement

        // Mock canvas and context
        const mockGetContext = jest.fn().mockImplementation((name) => {
            if (['webgl', 'webgl2'].includes(name)) {
                return {
                    getParameter: jest.fn()
                }
            }
            return null
        })
        const mockCanvas = {
            getContext: mockGetContext
        }

        // Override document.createElement
        document.createElement = jest.fn().mockImplementation((tagName) => {
            if (tagName === 'canvas') {
                return mockCanvas
            }
            return originalCreateElement.call(document, tagName)
        })

        const result = {
            isSupported: true
        }

        const { getMapProvider } = await import('../../src/js/provider/registry.js')

        const maplibreProvider = getMapProvider('maplibre')
        expect(maplibreProvider.checkSupport()).toEqual(result)

        const esriProvider = getMapProvider('esri')
        expect(esriProvider.checkSupport()).toEqual(result)
    })

    it('should return no array.prototype.findLast support', async () => {
        const originalFindLast = Array.prototype.findLast
        delete Array.prototype.findLast

        const { getMapProvider } = await import('../../src/js/provider/registry.js')
        const esriProvider = getMapProvider('esri')

        expect(esriProvider.checkSupport()).toEqual({
            isSupported: false,
            error: 'Array.prototype.findLast() is not supported'
        })

        // Restore after test
        Array.prototype.findLast = originalFindLast
    })

    it('should load the maplibre provider module', async () => {
        jest.mock('../../src/js/provider/maplibre/provider.js', () => ({
            __esModule: true,
            default: { name: 'MockMaplibreProvider' }
        }), { virtual: true })

        // Dynamically import registry AFTER mocking
        const { getMapProvider } = await import('../../src/js/provider/registry.js')
        const maplibre = getMapProvider('maplibre')
        const loaded = await maplibre.load()

        expect(loaded).toEqual({ name: 'MockMaplibreProvider' })
    })

    it('should load the esri provider module', async () => {
        jest.mock('../../src/js/provider/esri/provider.js', () => ({
            __esModule: true,
            default: { name: 'MockEsriProvider' }
        }), { virtual: true })

        // Dynamically import registry AFTER mocking
        const { getMapProvider } = await import('../../src/js/provider/registry.js')
        const esri = getMapProvider('esri')
        const loaded = await esri.load()

        expect(loaded).toEqual({ name: 'MockEsriProvider' })
    })

    it('should load the geocode provider module', async () => {
        jest.mock('../../src/js/provider/os-open-names/geocode.js', () => ({
            __esModule: true,
            default: { name: 'MockGeocodeProvider' }
        }), { virtual: true })

        // Dynamically import registry AFTER mocking
        const { getGeocodeProvider } = await import('../../src/js/provider/registry.js')
        const geocode = getGeocodeProvider('os-open-names')
        const loaded = await geocode.load()

        expect(loaded).toEqual({ name: 'MockGeocodeProvider' })
    })

    it('should load the reverse geocode provider module', async () => {
        jest.mock('../../src/js/provider/os-open-names/reverse-geocode.js', () => ({
            __esModule: true,
            default: { name: 'MockReverseGeocodeProvider' }
        }), { virtual: true })

        // Dynamically import registry AFTER mocking
        const { getReverseGeocodeProvider } = await import('../../src/js/provider/registry.js')
        const reverseGeocode = getReverseGeocodeProvider('os-open-names')
        const loaded = await reverseGeocode.load()

        expect(loaded).toEqual({ name: 'MockReverseGeocodeProvider' })
    })

    it('should register a valid provider descriptor', async () => {
        const { registerMapProvider, getMapProvider } = await import('../../src/js/provider/registry.js')
        const mockProvider = {
            id: 'custom',
            init: () => Promise.resolve()
        }
        registerMapProvider(mockProvider)
        const result = getMapProvider('custom')
        expect(result).toBe(mockProvider)
    })

    it('should throw if id is missing', async () => {
        const { registerMapProvider } = await import('../../src/js/provider/registry.js')
        const badDescriptor = { init: () => Promise.resolve() }
        expect(() => registerMapProvider(badDescriptor)).toThrow('Invalid provider descriptor')
    })

    it('should throw if init is not a function', async () => {
        const { registerMapProvider } = await import('../../src/js/provider/registry.js')
        const badDescriptor = { id: 'bad', init: null }
        expect(() => registerMapProvider(badDescriptor)).toThrow('Invalid provider descriptor')
    })
})
