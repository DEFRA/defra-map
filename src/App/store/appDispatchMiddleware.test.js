// src/core/store/appDispatchMiddleware.test.js
import { handleActionSideEffects } from './appDispatchMiddleware.js'
import eventBus from '../../services/eventBus.js'
import { EVENTS as events } from '../../config/events.js'

jest.mock('../../services/eventBus.js')

describe('appDispatchMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const waitForMicrotask = (callback) => {
    queueMicrotask(callback)
  }

  describe('CLOSE_PANEL', () => {
    it('emits panel closed event', (done) => {
      handleActionSideEffects(
        { type: 'CLOSE_PANEL', payload: 'testPanel' },
        { openPanels: {} },
        { panelConfig: {} }
      )

      waitForMicrotask(() => {
        expect(eventBus.emit).toHaveBeenCalledWith(
          events.APP_PANEL_CLOSED,
          { panelId: 'testPanel' }
        )
        done()
      })
    })
  })

  describe('CLOSE_ALL_PANELS', () => {
    it('emits closed event for each panel', (done) => {
      handleActionSideEffects(
        { type: 'CLOSE_ALL_PANELS' },
        { openPanels: { panel1: {}, panel2: {} } },
        { panelConfig: {} }
      )

      waitForMicrotask(() => {
        expect(eventBus.emit).toHaveBeenCalledTimes(2)
        expect(eventBus.emit).toHaveBeenCalledWith(events.APP_PANEL_CLOSED, { panelId: 'panel1' })
        expect(eventBus.emit).toHaveBeenCalledWith(events.APP_PANEL_CLOSED, { panelId: 'panel2' })
        done()
      })
    })
  })

  describe('OPEN_PANEL', () => {
    it('emits panel opened event for regular panel', (done) => {
      const config = {
        panelConfig: {
          newPanel: { md: { exclusive: false, modal: false } }
        }
      }

      handleActionSideEffects(
        { type: 'OPEN_PANEL', payload: { panelId: 'newPanel', props: { foo: 'bar' } } },
        { openPanels: {}, breakpoint: 'md' },
        config
      )

      waitForMicrotask(() => {
        expect(eventBus.emit).toHaveBeenCalledWith(
          events.APP_PANEL_OPENED,
          { panelId: 'newPanel', props: { foo: 'bar' } }
        )
        done()
      })
    })

    it('closes all non-exclusive panels when opening exclusive non-modal panel', (done) => {
      const config = {
        panelConfig: {
          exclusivePanel: { md: { exclusive: true, modal: false } },
          regularPanel1: { md: { exclusive: false, modal: false } },
          regularPanel2: { md: { exclusive: false, modal: false } },
          exclusivePanel2: { md: { exclusive: true, modal: false } }
        }
      }

      handleActionSideEffects(
        { type: 'OPEN_PANEL', payload: { panelId: 'exclusivePanel', props: {} } },
        { 
          openPanels: { 
            regularPanel1: {}, 
            regularPanel2: {}, 
            exclusivePanel2: {} 
          }, 
          breakpoint: 'md' 
        },
        config
      )

      waitForMicrotask(() => {
        expect(eventBus.emit).toHaveBeenCalledTimes(3)
        expect(eventBus.emit).toHaveBeenCalledWith(events.APP_PANEL_CLOSED, { panelId: 'regularPanel1' })
        expect(eventBus.emit).toHaveBeenCalledWith(events.APP_PANEL_CLOSED, { panelId: 'regularPanel2' })
        expect(eventBus.emit).toHaveBeenCalledWith(events.APP_PANEL_OPENED, { panelId: 'exclusivePanel', props: {} })
        done()
      })
    })

    it('closes all exclusive non-modal panels when opening regular panel', (done) => {
      const config = {
        panelConfig: {
          regularPanel: { md: { exclusive: false, modal: false } },
          exclusivePanel1: { md: { exclusive: true, modal: false } },
          exclusivePanel2: { md: { exclusive: true, modal: false } },
          exclusiveModalPanel: { md: { exclusive: true, modal: true } },
          regularPanel2: { md: { exclusive: false, modal: false } }
        }
      }

      handleActionSideEffects(
        { type: 'OPEN_PANEL', payload: { panelId: 'regularPanel', props: {} } },
        { 
          openPanels: { 
            exclusivePanel1: {}, 
            exclusivePanel2: {},
            exclusiveModalPanel: {},
            regularPanel2: {}
          }, 
          breakpoint: 'md' 
        },
        config
      )

      waitForMicrotask(() => {
        expect(eventBus.emit).toHaveBeenCalledTimes(3)
        expect(eventBus.emit).toHaveBeenCalledWith(events.APP_PANEL_CLOSED, { panelId: 'exclusivePanel1' })
        expect(eventBus.emit).toHaveBeenCalledWith(events.APP_PANEL_CLOSED, { panelId: 'exclusivePanel2' })
        expect(eventBus.emit).toHaveBeenCalledWith(events.APP_PANEL_OPENED, { panelId: 'regularPanel', props: {} })
        done()
      })
    })

    it('does not close any panels when opening modal', (done) => {
      const config = {
        panelConfig: {
          modalPanel: { md: { modal: true } },
          regularPanel: { md: { exclusive: false, modal: false } },
          exclusivePanel: { md: { exclusive: true, modal: false } }
        }
      }

      handleActionSideEffects(
        { type: 'OPEN_PANEL', payload: { panelId: 'modalPanel', props: {} } },
        { openPanels: { regularPanel: {}, exclusivePanel: {} }, breakpoint: 'md' },
        config
      )

      waitForMicrotask(() => {
        expect(eventBus.emit).toHaveBeenCalledTimes(1)
        expect(eventBus.emit).toHaveBeenCalledWith(events.APP_PANEL_OPENED, { panelId: 'modalPanel', props: {} })
        done()
      })
    })
  })
})