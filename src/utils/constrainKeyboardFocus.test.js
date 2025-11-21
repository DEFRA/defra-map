/**
 * @jest-environment jsdom
 */

import { constrainKeyboardFocus } from './constrainKeyboardFocus'

describe('constrainKeyboardFocus (Concise)', () => {
  let containerEl
  let focusableEl1, focusableEl2, focusableEl3
  let mockEvent

  // Helper to create and append elements quickly
  const createFocusableElement = (tag = 'button', text = '') => {
    const el = document.createElement(tag)
    el.textContent = text
    containerEl.appendChild(el)
    
    // Ensure all test elements have focus mocks and are considered 'visible' by JSDOM
    el.focus = jest.fn() 
    Object.defineProperty(el, 'offsetParent', { value: true, configurable: true })
    
    return el
  }
  
  // Helper to reliably set document.activeElement by mocking the getter
  const setActiveElement = (el) => {
    Object.defineProperty(document, 'activeElement', {
      value: el,
      writable: true,
      configurable: true,
    })
  }

  beforeEach(() => {
    document.body.innerHTML = '<div id="container" tabindex="-1"></div>'
    containerEl = document.getElementById('container')
    containerEl.focus = jest.fn() // Add focus mock for container

    // Setup 3 focusable elements: 1 (first), 2 (middle), 3 (last)
    focusableEl1 = createFocusableElement('button', '1')
    focusableEl2 = createFocusableElement('input')
    focusableEl3 = createFocusableElement('a')
    focusableEl3.setAttribute('href', '#')
    
    // Default mock event (simulates Tab press, no shift)
    mockEvent = {
      key: 'Tab',
      shiftKey: false,
      preventDefault: jest.fn()
    }
  })

  // --- Core Trapping Logic ---

  it('should trap focus for both forward (Tab) and backward (Shift+Tab) wrap actions', () => {
    // 1. FORWARD TRAP (Last to First)
    setActiveElement(focusableEl3)
    mockEvent.shiftKey = false
    
    constrainKeyboardFocus(containerEl, mockEvent)
    
    // Expect focusableEl1.focus() to be called
    expect(focusableEl1.focus).toHaveBeenCalledTimes(1)
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)

    // 2. BACKWARD TRAP (First to Last)
    setActiveElement(focusableEl1)
    mockEvent.shiftKey = true
    
    constrainKeyboardFocus(containerEl, mockEvent)
    
    // Expect focusableEl3.focus() to be called
    expect(focusableEl3.focus).toHaveBeenCalledTimes(1)
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(2)
  })
  
  it('should trap backward focus when starting from the container itself', () => {
    setActiveElement(containerEl) // activeElement === containerEl
    mockEvent.shiftKey = true
    
    constrainKeyboardFocus(containerEl, mockEvent)
    
    // Expect focusableEl3.focus() to be called (last element)
    expect(focusableEl3.focus).toHaveBeenCalledTimes(1)
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
  })

  // --- Negative & Edge Cases ---

  it('should NOT trap focus when tabbing mid-list, using a non-Tab key, or if container is empty', () => {
    // 1. Case: Key is not 'Tab' (Exits early)
    mockEvent.key = 'Enter'
    setActiveElement(focusableEl3)
    constrainKeyboardFocus(containerEl, mockEvent)
    expect(focusableEl1.focus).not.toHaveBeenCalled()
    expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    
    // Reset key
    mockEvent.key = 'Tab'
    
    // 2. Case: Tabbing forward mid-list (Skip trap logic)
    setActiveElement(focusableEl2)
    mockEvent.shiftKey = false
    constrainKeyboardFocus(containerEl, mockEvent)
    expect(focusableEl1.focus).not.toHaveBeenCalled() 
    
    // 3. Case: Tabbing backward mid-list (Skip trap logic)
    setActiveElement(focusableEl2)
    mockEvent.shiftKey = true
    constrainKeyboardFocus(containerEl, mockEvent)
    expect(focusableEl3.focus).not.toHaveBeenCalled()
    
    // 4. Case: No focusable elements (Tests the new utility guard clause)
    containerEl.innerHTML = '' 
    setActiveElement(containerEl)
    
    // Expect no error (due to utility fix) and no trapping
    expect(() => constrainKeyboardFocus(containerEl, mockEvent)).not.toThrow()
    expect(mockEvent.preventDefault).not.toHaveBeenCalled() 
  })
  
  it('should filter out hidden elements from the focusable list', () => {
    // Create hidden element *before* focusableEl2
    const hiddenEl = createFocusableElement('button', 'Hidden')
    
    // Explicitly set offsetParent to null for the hidden element test
    Object.defineProperty(hiddenEl, 'offsetParent', { value: null, configurable: true }) 
    
    // Focus is on the last VISIBLE element (focusableEl3).
    setActiveElement(focusableEl3)
    mockEvent.shiftKey = false // Forward Tab (should wrap from 3 to 1)
    
    constrainKeyboardFocus(containerEl, mockEvent)
    
    // Focus should wrap to focusableEl1 (the first *visible* element), skipping 'hiddenEl'.
    expect(focusableEl1.focus).toHaveBeenCalledTimes(1)
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
  })
})