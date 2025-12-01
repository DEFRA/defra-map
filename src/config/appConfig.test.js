import React from 'react'
import { render } from '@testing-library/react'
import { appConfig } from './appConfig'

describe('appConfig', () => {
  const appState = { layoutRefs: { appContainerRef: { current: document.createElement('div') } }, isFullscreen: false }
  const buttons = appConfig.buttons
  const fullscreenBtn = buttons.find(b => b.id === 'fullscreen')
  const exitBtn = buttons.find(b => b.id === 'exit')

  it('renders KeyboardHelp panel', () => {
    const panel = appConfig.panels.find(p => p.id === 'keyboardHelp')
    const { container } = render(panel.render())
    expect(container.querySelector('.dm-c-keyboard-help')).toBeInTheDocument()
  })

  it('evaluates dynamic button properties', () => {
    // label
    expect(typeof fullscreenBtn.label).toBe('function')
    expect(fullscreenBtn.label({ appState, appConfig })).toMatch(/fullscreen/)

    // iconId
    expect(typeof fullscreenBtn.iconId).toBe('function')
    expect(fullscreenBtn.iconId({ appState, appConfig })).toBe('maximise')

    // excludeWhen
    expect(exitBtn.excludeWhen({ appConfig: { hasExitButton: false } })).toBe(true)
    expect(fullscreenBtn.excludeWhen({ appState, appConfig: { enableFullscreen: true } })).toBe(false)
  })

  it('calls fullscreen onClick correctly', () => {
    const containerMock = { requestFullscreen: jest.fn() }
    const appStateMock = { layoutRefs: { appContainerRef: { current: containerMock } }, isFullscreen: false }

    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true })
    document.exitFullscreen = jest.fn()

    // Enter fullscreen
    fullscreenBtn.onClick({}, { appState: appStateMock })
    expect(containerMock.requestFullscreen).toHaveBeenCalled()
    expect(document.exitFullscreen).not.toHaveBeenCalled()

    // Exit fullscreen
    Object.defineProperty(document, 'fullscreenElement', { value: containerMock })
    fullscreenBtn.onClick({}, { appState: appStateMock })
    expect(document.exitFullscreen).toHaveBeenCalled()
  })

  it('evaluates fullscreen button label and iconId for both fullscreen states', () => {
    const containerMock = { requestFullscreen: jest.fn() }

    // Not in fullscreen
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true })
    expect(fullscreenBtn.label({ appState, appConfig })).toBe('Enter fullscreen')
    expect(fullscreenBtn.iconId({ appState, appConfig })).toBe('maximise')

    // In fullscreen
    Object.defineProperty(document, 'fullscreenElement', { value: containerMock, writable: true })
    expect(fullscreenBtn.label({ appState, appConfig })).toBe('Exit fullscreen')
    expect(fullscreenBtn.iconId({ appState, appConfig })).toBe('minimise')
  })

  it('calls exit button onClick correctly', () => {
    const handleExitClick = jest.fn()
    const fakeEvent = {}

    // Case 1: history.state?.isBack = true
    Object.defineProperty(history, 'state', { value: { isBack: true }, writable: true })
    const historyBackSpy = jest.spyOn(history, 'back').mockImplementation(() => {})
    exitBtn.onClick(fakeEvent, { appConfig: { handleExitClick } })
    expect(historyBackSpy).toHaveBeenCalled()
    expect(handleExitClick).not.toHaveBeenCalled()
    historyBackSpy.mockRestore()

    // Case 2: history.state?.isBack = false
    Object.defineProperty(history, 'state', { value: {}, writable: true })
    const handleExitClickSpy = jest.fn()
    exitBtn.onClick(fakeEvent, { appConfig: { handleExitClick: handleExitClickSpy } })
    expect(handleExitClickSpy).toHaveBeenCalled()
  })
})
