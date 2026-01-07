import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import Actions from '../../src/js/components/actions'
import eventBus from '../../src/js/lib/eventbus'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/lib/eventbus')
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

describe('actions', () => {
  beforeEach(jest.clearAllMocks)
  const drawFinish = jest.fn()
  const dispatch = jest.fn()
  const viewportDispatch = jest.fn()
  const viewPortRefFocus = jest.fn()

  jest.mocked(useViewport).mockReturnValue({
    dispatch: viewportDispatch,
    size: null,
    dimensions: { area: '123' }
  })

  jest.mocked(eventBus)

  it('should handle click for Cancel label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
      provider: {
        map: true,
        draw: {
          cancel: drawFinish
        }
      },
      viewportRef: {
        current: {
          focus: viewPortRefFocus
        }
      }
    })

    render(<Actions />)

    fireEvent.click(screen.getByText('Cancel'))

    expect(drawFinish).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(viewPortRefFocus).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  describe('Finish/Done Button', () => {
    const provider = {
      map: true,
      draw: {
        finish: drawFinish
      }
    }

    const useAppValues = {
      dispatch,
      query: true,
      provider: { ...provider },
      viewportRef: {
        current: {
          focus: viewPortRefFocus
        }
      }
    }
    it('should handle click for Done when query is truthy', () => {
      jest.mocked(useApp).mockReturnValue({ ...useAppValues })
      render(<Actions />)
      const doneButton = screen.getByText('Done')

      fireEvent.click(doneButton)

      expect(doneButton).toBeTruthy()
      expect(drawFinish).toHaveBeenCalled()
      expect(dispatch).toHaveBeenCalled()
      expect(viewPortRefFocus).toHaveBeenCalled()
      expect(eventBus.dispatch).toHaveBeenCalled()
      expect(eventBus.dispatch).toHaveBeenNthCalledWith(1, undefined, 'appaction', { type: 'updatePolygon' })
      expect(eventBus.dispatch).toHaveBeenNthCalledWith(2, undefined, 'appchange', { drawMode: 'default', layers: undefined, segments: undefined, size: null, style: undefined, type: 'drawMode' })
    })

    it('should handle click for Finish when query is false', () => {
      jest.mocked(useApp).mockReturnValue({ ...useAppValues, query: false })
      render(<Actions />)
      const finishButton = screen.getByText('Finish')

      fireEvent.click(finishButton)

      expect(finishButton).toBeTruthy()
      expect(drawFinish).toHaveBeenCalled()
      expect(dispatch).toHaveBeenCalled()
      expect(viewPortRefFocus).toHaveBeenCalled()
      expect(eventBus.dispatch).toHaveBeenCalled()
      expect(eventBus.dispatch).toHaveBeenNthCalledWith(1, undefined, 'appaction', { type: 'confirmPolygon' })
      expect(eventBus.dispatch).toHaveBeenNthCalledWith(2, undefined, 'appchange', { drawMode: 'default', layers: undefined, segments: undefined, size: null, style: undefined, type: 'drawMode' })
    })

    it('should not call drawFinish if map is not set', () => {
      jest.mocked(useApp).mockReturnValue({ ...useAppValues, provider: { ...provider, map: false } })
      render(<Actions />)
      const doneButton = screen.getByText('Done')

      fireEvent.click(doneButton)

      expect(doneButton).toBeTruthy()
      expect(drawFinish).not.toHaveBeenCalled()
    })
  })

  it('should not call drawFinish if map is set but dimensions are not set', () => {
    jest.mocked(useViewport).mockReturnValue({
      dispatch: viewportDispatch,
      dimensions: { }
    })

    jest.mocked(useApp).mockReturnValue({
      dispatch,
      query: true,
      provider: {
        map: true,
        draw: {
          finish: drawFinish
        }
      },
      viewportRef: {
        current: {
          focus: viewPortRefFocus
        }
      }
    })

    render(<Actions />)

    fireEvent.click(screen.getByText('Done'))

    expect(screen.getByText('Done')).toBeTruthy()
    expect(drawFinish).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
    expect(viewPortRefFocus).not.toHaveBeenCalled()
    expect(eventBus.dispatch).not.toHaveBeenCalled()
  })

  it('should not call drawFinish if map is set but warningText is set and allowShape is false', () => {
    jest.mocked(useViewport).mockReturnValue({
      dispatch: viewportDispatch,
      dimensions: { area: '123', allowShape: false }
    })

    jest.mocked(useApp).mockReturnValue({
      warningText: 'warning',
      dispatch,
      query: true,
      provider: {
        map: true,
        draw: {
          finish: drawFinish
        }
      },
      viewportRef: {
        current: {
          focus: viewPortRefFocus
        }
      }
    })

    render(<Actions />)

    fireEvent.click(screen.getByText('Done'))

    expect(screen.getByText('Done')).toBeTruthy()
    expect(drawFinish).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
    expect(viewPortRefFocus).not.toHaveBeenCalled()
    expect(eventBus.dispatch).not.toHaveBeenCalled()
  })

  describe('Get info', () => {
    it('should call handlePixelClick when clicked', async () => {
      jest.mocked(useApp).mockReturnValue({
        interfaceType: 'touch',
        isTargetVisible: true,

        viewportRef: {
          current: {
            dispatchEvent: viewportDispatch
          }
        }
      })
      render(<Actions />)
      const getInfo = screen.getByText('Get info')

      expect(getInfo).toBeTruthy()
      expect(getInfo).toBeVisible()
      fireEvent.click(getInfo)
      expect(viewportDispatch).toHaveBeenCalled()
    })

    it('should not be visible if interfaceType is not touch', async () => {
      jest.mocked(useApp).mockReturnValue({})
      const { container } = render(<Actions />)
      console.log(container.style)
      const getInfo = screen.getByText('Get info')

      expect(getInfo).toBeTruthy()
      expect(getInfo).not.toBeVisible()
    })
  })

  describe('submitLabel', () => {
    it('should call handlePolygonClick if queryArea.submitLabel is clicked', async () => {
      jest.mocked(useApp).mockReturnValue({
        queryArea: { submitLabel: 'Submit' },
        mode: 'default',
        query: true
      })
      const { container } = await render(<Actions />)
      console.log('container.outerHTML', container.outerHTML)
      const submit = screen.getByText('Submit')
      expect(submit).toBeTruthy()
      expect(submit).toBeVisible()
      fireEvent.click(submit)
      expect(eventBus.dispatch).toHaveBeenCalled()
    })

    describe('submitLabel visibility', () => {
      const values = [
        [true, 'default', true, 'KEY', 'KEY', false],
        [true, 'default', true, 'NOT-KEY', 'NOT-KEY', true],
        [false, 'default', true, 'KEY', 'KEY', true],
        [false, 'not-default', true, 'KEY', 'KEY', false],
        [false, 'default', true, 'STYLE', 'INSPECTOR', false],
        [true, 'default', true, 'STYLE', 'NOT-INSPECTOR', false]
      ]
      values.forEach(([expectedVisibility, mode, query, activePanel, previousPanel, isMobile]) => {
        it(`should ${expectedVisibility ? '' : 'not '}show submitLabel when mode: ${mode}, query: ${query}, activePanel: ${activePanel}, previousPanel: ${previousPanel}, isMobile: ${isMobile}`, async () => {
          jest.mocked(useApp).mockReturnValue({
            queryArea: { submitLabel: 'Submit' },
            mode,
            query,
            activePanel,
            previousPanel,
            isMobile
          })
          await render(<Actions />)
          const submit = screen.getByText('Submit')
          expect(submit).toBeTruthy()
          if (expectedVisibility) {
            expect(submit).toBeVisible()
          } else {
            expect(submit).not.toBeVisible()
          }
        })
      })
    })
  })
})
