import 'jest-canvas-mock'

describe('provider', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should return no support', async () => {
        const provider = (await import('../../../src/js/provider/esri/index.js')).default

        const result = {
            isSupported: false,
            error: 'WebGL is not supported'
        }
        
        expect(provider.checkSupport()).toEqual(result)
    })

    it('should return webgl suported but disabled', async () => {
        Object.defineProperty(window, 'WebGLRenderingContext', {
            writable: true,
            value: true
        })

        const provider = (await import('../../../src/js/provider/esri/index.js')).default

        const result = {
            isSupported: false,
            error: 'WebGL is supported, but disabled'
        }

        expect(provider.checkSupport()).toEqual(result)
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

        const provider = (await import('../../../src/js/provider/esri/index.js')).default
        expect(provider.checkSupport()).toEqual(result)
    })

    it('should return no array.prototype.findLast support', async () => {
        const originalFindLast = Array.prototype.findLast
        delete Array.prototype.findLast

        const provider = (await import('../../../src/js/provider/esri/index.js')).default

        expect(provider.checkSupport()).toEqual({
            isSupported: false,
            error: 'Array.prototype.findLast() is not supported'
        })

        // Restore after test
        Array.prototype.findLast = originalFindLast
    })

    it('should load the esri provider module', async () => {
        jest.mock('../../../src/js/provider/esri/index.js', () => ({
            __esModule: true,
            default: {
                load: jest.fn().mockResolvedValue(function MockEsriProvider() {})
            }
        }))

        // Dynamically import registry AFTER mocking
        const provider = (await import('../../../src/js/provider/esri/index.js')).default
        const loaded = await provider.load()

        expect(loaded.name).toBe('MockEsriProvider')
    })

    // it('should load the geocode provider module', async () => {
    //     jest.mock('../../../src/js/provider/os-open-names/geocode.js', () => ({
    //         __esModule: true,
    //         default: { name: 'MockGeocodeProvider' }
    //     }), { virtual: true })

    //     // Dynamically import registry AFTER mocking
    //     const { getGeocodeProvider } = await import('../../../src/js/provider/registry.js')
    //     const geocode = getGeocodeProvider('os-open-names')
    //     const loaded = await geocode.load()

    //     expect(loaded).toEqual({ name: 'MockGeocodeProvider' })
    // })

    // it('should load the reverse geocode provider module', async () => {
    //     jest.mock('../../../src/js/provider/os-open-names/reverse-geocode.js', () => ({
    //         __esModule: true,
    //         default: { name: 'MockReverseGeocodeProvider' }
    //     }), { virtual: true })

    //     // Dynamically import registry AFTER mocking
    //     const { getReverseGeocodeProvider } = await import('../../../src/js/provider/registry.js')
    //     const reverseGeocode = getReverseGeocodeProvider('os-open-names')
    //     const loaded = await reverseGeocode.load()

    //     expect(loaded).toEqual({ name: 'MockReverseGeocodeProvider' })
    // })
})
