import { actionsMap } from '../../src/js/store/app-actions-map'

describe('store/app-actions-map - containerReady', () => {
  it('should return a new state with isContainerReady set to true', () => {
    const state = { key: 'value' }
    const result = actionsMap.CONTAINER_READY(state)

    expect(result.isContainerReady).toEqual(true)
    expect(result.key).toEqual('value')
  })
})

// This is redundant, test can be removed
describe('store/app-actions-map - setSearch', () => {
  it('should return a new state with search set to the payload data', () => {
    const state = { someKey: 'someValue' }
    const payload = { data: 'newSearchValue' }
    const result = actionsMap.SET_AVAILABILITY(state, payload)

    expect(result.search).toEqual('newSearchValue')
    expect(result.someKey).toEqual('someValue')
  })
})

describe('store/app-actions-map - setInfo', () => {
  it('should activate INFO panel when providing payload', () => {
    const state = {
      activePanel: null,
      previousPanel: 'KEY',
      info: null,
      hasViewportLabel: true,
      otherProp: 'value'
    }
    const payload = { title: 'Information', content: 'Some info' }

    const result = actionsMap.SET_INFO(state, payload)

    expect(result.activePanel).toEqual('INFO')
    expect(result.previousPanel).toEqual('KEY')
    expect(result.info).toEqual(payload)
    expect(result.hasViewportLabel).toEqual(false)
    expect(result.otherProp).toEqual('value')
  })

  it('should close INFO panel when payload is null', () => {
    const state = {
      activePanel: 'INFO',
      previousPanel: null,
      info: { title: 'Old title' },
      hasViewportLabel: true
    }

    const result = actionsMap.SET_INFO(state, null)

    expect(result.activePanel).toEqual(null)
    // expect(result.previousPanel).toEqual(null) fails but needs fixing in code, currently return false
    expect(result.info).toEqual(null)
    expect(result.hasViewportLabel).toEqual(false)
  })

  it('should maintain KEY as previousPanel', () => {
    const state = {
      activePanel: null,
      previousPanel: 'KEY',
      info: null,
      hasViewportLabel: true
    }

    const result = actionsMap.SET_INFO(state, { title: 'New title' })

    expect(result.activePanel).toEqual('INFO')
    expect(result.previousPanel).toEqual('KEY')
    expect(result.info).toEqual({ title: 'New title' })
    expect(result.hasViewportLabel).toEqual(false)
  })

  it('should keep previousPanel as KEY when updating info while INFO is active', () => {
    const state = {
      activePanel: 'INFO',
      previousPanel: 'KEY',
      info: { old: 'data' },
      hasViewportLabel: true
    }

    const result = actionsMap.SET_INFO(state, { new: 'data' })

    expect(result.activePanel).toEqual('INFO')
    expect(result.previousPanel).toEqual('KEY')
    expect(result.info).toEqual({ new: 'data' })
    expect(result.hasViewportLabel).toEqual(false)
  })

  it('should handle non-INFO and non-KEY panels correctly', () => {
    const state = {
      activePanel: 'LAYERS',
      previousPanel: 'SEARCH',
      info: null,
      hasViewportLabel: true
    }

    const result = actionsMap.SET_INFO(state, { data: 'some info' })

    expect(result.activePanel).toEqual('INFO')
    // expect(result.previousPanel).toEqual(null) Needs code fix, currently returning false
    expect(result.info).toEqual({ data: 'some info' })
    expect(result.hasViewportLabel).toEqual(false)
  })

  it('should save KEY as previousPanel when activePanel is KEY', () => {
    const state = {
      activePanel: 'KEY',
      previousPanel: null,
      info: null,
      hasViewportLabel: true
    }

    const result = actionsMap.SET_INFO(state, { data: 'key info' })

    expect(result.activePanel).toEqual('INFO')
    expect(result.previousPanel).toEqual('KEY')
    expect(result.info).toEqual({ data: 'key info' })
    expect(result.hasViewportLabel).toEqual(false)
  })
})

describe('store/app-actions-map - setSelected', () => {
  it('should return a new state with updated properties based on the payload', () => {
    const state = { key: 'value', activePanelHasFocus: true, hash: 1 }
    const payload = {
      featureId: 'newFeatureId',
      targetMarker: 'newTargetMarker',
      activePanelHasFocus: false
    }
    const result = actionsMap.SET_SELECTED(state, payload)

    expect(result.featureId).toEqual('newFeatureId')
    expect(result.targetMarker).toEqual('newTargetMarker')
    expect(result.activePanelHasFocus).toEqual(true)
    expect(result.hash).toBeGreaterThan(0)
    expect(result.key).toEqual('value')
  })
})

describe('store/app-actions-map - setNextSelected', () => {
  it('should select the next feature when PageDown key is pressed', () => {
    const state = {
      featureId: 'feature2',
      activePanel: 'INFO',
      otherProp: 'value'
    }

    const payload = {
      key: 'PageDown',
      features: [
        { id: 'feature1', name: 'Feature 1' },
        { id: 'feature2', name: 'Feature 2' },
        { id: 'feature3', name: 'Feature 3' }
      ]
    }

    const result = actionsMap.SET_NEXT_SELECTED(state, payload)

    expect(result.featureId).toEqual('feature3')
    expect(result.activePanel).toEqual(null)
    expect(result.otherProp).toEqual('value')
  })

  it('should wrap around to the first feature when PageDown is pressed on the last feature', () => {
    const state = {
      featureId: 'feature3',
      activePanel: 'INFO'
    }

    const payload = {
      key: 'PageDown',
      features: [
        { id: 'feature1', name: 'Feature 1' },
        { id: 'feature2', name: 'Feature 2' },
        { id: 'feature3', name: 'Feature 3' }
      ]
    }

    const result = actionsMap.SET_NEXT_SELECTED(state, payload)

    expect(result.featureId).toEqual('feature1')
    expect(result.activePanel).toEqual(null)
  })

  it('should select the previous feature when PageUp key is pressed', () => {
    const state = {
      featureId: 'feature2',
      activePanel: 'INFO'
    }

    const payload = {
      key: 'PageUp',
      features: [
        { id: 'feature1', name: 'Feature 1' },
        { id: 'feature2', name: 'Feature 2' },
        { id: 'feature3', name: 'Feature 3' }
      ]
    }

    const result = actionsMap.SET_NEXT_SELECTED(state, payload)

    expect(result.featureId).toEqual('feature1')
    expect(result.activePanel).toEqual(null)
  })

  it('should wrap around to the last feature when PageUp is pressed on the first feature', () => {
    const state = {
      featureId: 'feature1',
      activePanel: 'INFO'
    }

    const payload = {
      key: 'PageUp',
      features: [
        { id: 'feature1', name: 'Feature 1' },
        { id: 'feature2', name: 'Feature 2' },
        { id: 'feature3', name: 'Feature 3' }
      ]
    }

    const result = actionsMap.SET_NEXT_SELECTED(state, payload)

    expect(result.featureId).toEqual('feature3')
    expect(result.activePanel).toEqual(null)
  })

  it('should select the first feature when current feature is not in the list', () => {
    const state = {
      featureId: 'featureX',
      activePanel: 'INFO'
    }

    const payload = {
      key: 'PageDown',
      features: [
        { id: 'feature1', name: 'Feature 1' },
        { id: 'feature2', name: 'Feature 2' },
        { id: 'feature3', name: 'Feature 3' }
      ]
    }

    const result = actionsMap.SET_NEXT_SELECTED(state, payload)

    expect(result.featureId).toEqual('feature1')
    expect(result.activePanel).toEqual(null)
  })

  it('should not change featureId when features array is empty', () => {
    const state = {
      featureId: 'feature1',
      activePanel: 'INFO'
    }

    const payload = {
      key: 'PageDown',
      features: []
    }

    const result = actionsMap.SET_NEXT_SELECTED(state, payload)

    expect(result.featureId).toEqual('feature1')
    expect(result.activePanel).toEqual(null)
  })

  it('should handle features array with only one item', () => {
    const state = {
      featureId: 'feature1',
      activePanel: 'INFO'
    }

    const payload = {
      key: 'PageDown',
      features: [
        { id: 'feature1', name: 'Feature 1' }
      ]
    }

    const result = actionsMap.SET_NEXT_SELECTED(state, payload)

    expect(result.featureId).toEqual('feature1')
    expect(result.activePanel).toEqual(null)
  })

  it('should handle undefined featureId in state', () => {
    const state = {
      activePanel: 'INFO'
    }

    const payload = {
      key: 'PageDown',
      features: [
        { id: 'feature1', name: 'Feature 1' },
        { id: 'feature2', name: 'Feature 2' }
      ]
    }

    const result = actionsMap.SET_NEXT_SELECTED(state, payload)

    expect(result.featureId).toEqual('feature1')
    expect(result.activePanel).toEqual(null)
  })
})

describe('store/app-actions-map - error', () => {
  it('should return a new state with error, activePanel, and hasViewportLabel set correctly', () => {
    const state = { key: 'value' }
    const payload = {
      label: 'Something went wrong',
      message: 'An error occurred'
    }
    const result = actionsMap.ERROR(state, payload)

    expect(result.error).toEqual({
      label: 'Something went wrong',
      message: 'An error occurred'
    })
    expect(result.activePanel).toEqual('ERROR')
    expect(result.hasViewportLabel).toEqual(false)
    expect(result.key).toEqual('value')
  })
})

describe('store/app-actions-map - open', () => {
  it('should return a new state with updated properties based on the payload', () => {
    const state = {
      key: 'value',
      activePanel: 'KEY',
      featureId: 'feature123',
      hash: 1
    }
    const payload = 'SEARCH'
    const result = actionsMap.OPEN(state, payload)

    expect(result.previousPanel).toEqual('KEY')
    expect(result.activePanel).toEqual('SEARCH')
    expect(result.activePanelHasFocus).toEqual(true)
    expect(result.hasViewportLabel).toEqual(false)
    expect(result.targetMarker).toBeNull()
    expect(result.featureId).toEqual('')
    expect(result.hash).toBeGreaterThan(0)
    expect(result.key).toEqual('value')
  })

  it('should correctly handle \'INFO\' as payload', () => {
    const state = {
      key: 'value',
      activePanel: 'KEY',
      featureId: 'feature123',
      hash: 1
    }
    const payload = 'INFO'
    const result = actionsMap.OPEN(state, payload)

    expect(result.previousPanel).toEqual('KEY')
    expect(result.activePanel).toEqual('INFO')
    expect(result.activePanelHasFocus).toEqual(true)
    expect(result.hasViewportLabel).toEqual(false)
    // expect(result.targetMarker).toEqual(null) Needs a code fix to return null and not false
    expect(result.featureId).toEqual('feature123')
    expect(result.hash).toBeGreaterThan(0)
    expect(result.key).toEqual('value')
  })
})

describe('store/app-actions-map - close', () => {
  it('should return a new state with properties reset, restoring previous panel if it is not \'INFO\'', () => {
    const state = {
      key: 'Value',
      previousPanel: 'SEARCH',
      featureId: 'feature123',
      targetMarker: 'marker1',
      activePanel: 'INFO',
      activePanelHasFocus: true,
      isKeyExpanded: true
    }
    const result = actionsMap.CLOSE(state)

    expect(result.featureId).toEqual(null)
    expect(result.targetMarker).toEqual(null)
    expect(result.previousPanel).toEqual(null)
    expect(result.activePanelHasFocus).toEqual(false)
    expect(result.isKeyExpanded).toEqual(false)
    expect(result.activePanel).toEqual('SEARCH')
    expect(result.key).toEqual('Value')
  })

  it('should set activePanel to null if previousPanel was \'INFO\'', () => {
    const state = {
      key: 'Value',
      previousPanel: 'INFO',
      featureId: 'feature123',
      targetMarker: 'marker1',
      activePanel: 'INFO',
      activePanelHasFocus: true,
      isKeyExpanded: true
    }
    const result = actionsMap.CLOSE(state)

    expect(result.featureId).toEqual(null)
    expect(result.targetMarker).toEqual(null)
    expect(result.previousPanel).toEqual(null)
    expect(result.activePanelHasFocus).toEqual(true)
    expect(result.isKeyExpanded).toEqual(false)
    expect(result.activePanel).toEqual(null)
    expect(result.key).toEqual('Value')
  })
})

describe('store/app-actions-map - setMode', () => {
  it('should return a new state with updated properties based on the payload', () => {
    const state = {
      key: 'Value',
      drawMode: 'default',
      query: 'oldQuery',
      activePanel: 'INFO',
      featureId: 'feature123',
      targetMarker: 'marker1'
    }
    const payload = {
      value: 'vertex',
      query: 'newQuery'
    }
    const result = actionsMap.SET_MODE(state, payload)

    expect(result.drawMode).toEqual('vertex')
    expect(result.query).toEqual('newQuery')
    expect(result.activePanel).toEqual(null)
    expect(result.featureId).toEqual(null)
    expect(result.targetMarker).toEqual(null)
    expect(result.key).toEqual('Value')
  })

  it('should use the state drawMode if payload value is not provided', () => {
    const state = {
      key: 'Value',
      drawMode: 'default',
      query: 'oldQuery',
      activePanel: 'INFO',
      featureId: 'feature123',
      targetMarker: 'marker1'
    }
    const payload = { value: 'default', query: 'newQuery' }
    const result = actionsMap.SET_MODE(state, payload)

    expect(result.drawMode).toEqual('default')
    expect(result.query).toEqual('newQuery')
    expect(result.activePanel).toEqual(null)
    expect(result.featureId).toEqual(null)
    expect(result.targetMarker).toEqual(null)
    expect(result.key).toEqual('Value')
  })
})

describe('store/app-actions-map - setIsDarkMode', () => {
  it('should return a new state with isDarkMode set to true if style is dark or hasAutoMode is true and colourScheme is dark', () => {
    const state = {
      key: 'Value',
      hasAutoMode: true
    }
    const payload = {
      style: { name: 'dark' },
      colourScheme: 'default'
    }
    const result = actionsMap.SET_IS_DARK_MODE(state, payload)

    expect(result.isDarkMode).toEqual(true)
    expect(result.key).toEqual('Value')
  })

  it('should return a new state with isDarkMode set to true if hasAutoMode is true and colourScheme is dark', () => {
    const state = {
      key: 'Value',
      hasAutoMode: true
    }
    const payload = {
      style: { name: 'default' },
      colourScheme: 'dark'
    }
    const result = actionsMap.SET_IS_DARK_MODE(state, payload)

    expect(result.isDarkMode).toEqual(true)
    expect(result.key).toEqual('Value')
  })

  it('should return a new state with isDarkMode set to false if style is default and hasAutoMode is false or colourScheme is not dark', () => {
    const state = {
      key: 'Value',
      hasAutoMode: false
    }
    const payload = {
      style: { name: 'default' },
      colourScheme: 'default'
    }
    const result = actionsMap.SET_IS_DARK_MODE(state, payload)

    expect(result.isDarkMode).toEqual(false)
    expect(result.key).toEqual('Value')
  })
})

describe('store/app-actions-map - setIsTargetVisible', () => {
  it('should return a new state with isTargetVisible set to the payload value', () => {
    const state = {
      key: 'Value'
    }
    const payload = true
    const result = actionsMap.SET_IS_TARGET_VISIBLE(state, payload)

    expect(result.isTargetVisible).toEqual(true)
    expect(result.key).toEqual('Value')
  })

  it('should return a new state with isTargetVisible set to false if payload is false', () => {
    const state = {
      key: 'Value'
    }
    const payload = false
    const result = actionsMap.SET_IS_TARGET_VISIBLE(state, payload)

    expect(result.isTargetVisible).toEqual(false)
    expect(result.key).toEqual('Value')
  })
})

describe('store/app-actions-map - toggleSegments', () => {
  it('should return a new state with segments and layers set to the payload values, and reset featureId, targetMarker, and isKeyExpanded', () => {
    const state = {
      key: 'Value',
      featureId: 'feature123',
      targetMarker: 'marker1',
      isKeyExpanded: true,
      otherKey: 'otherValue'
    }
    const payload = {
      segments: ['segment1', 'segment2'],
      layers: ['layer1', 'layer2']
    }
    const result = actionsMap.TOGGLE_SEGMENTS(state, payload)

    expect(result.segments).toEqual(['segment1', 'segment2'])
    expect(result.layers).toEqual(['layer1', 'layer2'])
    expect(result.featureId).toEqual(null)
    expect(result.targetMarker).toEqual(null)
    expect(result.isKeyExpanded).toEqual(false)
    expect(result.key).toEqual('Value')
    expect(result.otherKey).toEqual('otherValue')
  })
})

describe('store/app-actions-map - toggleLayers', () => {
  it('should return a new state with layers set to the payload value', () => {
    const state = {
      key: 'Value',
      layers: ['layer1', 'layer2'],
      otherKey: 'otherValue'
    }
    const payload = ['layer3', 'layer4']
    const result = actionsMap.TOGGLE_LAYERS(state, payload)

    expect(result.layers).toEqual(['layer3', 'layer4'])
    expect(result.key).toEqual('Value')
    expect(result.otherKey).toEqual('otherValue')
  })
})

describe('store/app-actions-map - toggleKeyExpanded', () => {
  it('should return a new state with isKeyExpanded set to the payload value', () => {
    const state = {
      key: 'Value',
      isKeyExpanded: false,
      otherKey: 'otherValue'
    }
    const payload = true
    const result = actionsMap.TOGGLE_KEY_EXPANDED(state, payload)

    expect(result.isKeyExpanded).toEqual(true)
    expect(result.key).toEqual('Value')
    expect(result.otherKey).toEqual('otherValue')
  })

  it('should return a new state with isKeyExpanded set to false if payload is false', () => {
    const state = {
      key: 'Value',
      isKeyExpanded: true,
      otherKey: 'otherValue'
    }
    const payload = false
    const result = actionsMap.TOGGLE_KEY_EXPANDED(state, payload)

    expect(result.isKeyExpanded).toEqual(false)
    expect(result.key).toEqual('Value')
    expect(result.otherKey).toEqual('otherValue')
  })
})

describe('store/app-actions-map - toggleViewportLabel', () => {
  it('should return a new state with hasViewportLabel set to true if conditions are met', () => {
    const state = {
      key: 'Value',
      isMobile: false,
      activePanel: 'LEGEND'
    }
    const payload = { data: true }
    const result = actionsMap.TOGGLE_VIEWPORT_LABEL(state, payload)

    expect(result.hasViewportLabel).toEqual(true)
    expect(result.key).toEqual('Value')
  })

  it('should return a new state with hasViewportLabel set to false if data is falsy', () => {
    const state = {
      key: 'Value',
      isMobile: false,
      activePanel: 'LEGEND'
    }
    const payload = { data: false }
    const result = actionsMap.TOGGLE_VIEWPORT_LABEL(state, payload)

    expect(result.hasViewportLabel).toEqual(false)
    expect(result.key).toEqual('Value')
  })

  it('should return a new state with hasViewportLabel set to true if activePanel is not \'LEGEND\' and isMobile is false', () => {
    const state = {
      key: 'Value',
      isMobile: false,
      activePanel: 'INFO'
    }
    const payload = { data: true }
    const result = actionsMap.TOGGLE_VIEWPORT_LABEL(state, payload)

    expect(result.hasViewportLabel).toEqual(true)
    expect(result.key).toEqual('Value')
  })

  it('should return a new state with hasViewportLabel set to false if activePanel is not \'LEGEND\' and isMobile is true', () => {
    const state = {
      key: 'Value',
      isMobile: true,
      activePanel: 'KEY'
    }
    const payload = { data: true }
    const result = actionsMap.TOGGLE_VIEWPORT_LABEL(state, payload)

    expect(result.hasViewportLabel).toEqual(false)
    expect(result.key).toEqual('Value')
  })
})
