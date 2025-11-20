import React, { useRef, useEffect } from 'react'
import { useConfig } from '../../store/configContext'
import { useApp } from '../../store/appContext'
import { stringToKebab } from '../../../utils/stringToKebab.js'
import { getIconRegistry } from '../../registry/iconRegistry.js'
import { useModalPanelBehaviour } from '../../hooks/useModalPanelBehaviour.js'

export const Panel = ({ panelId, panelConfig, props, WrappedChild, children }) => {
  const { id } = useConfig()
  const { dispatch, breakpoint, layoutRefs } = useApp()

  const rootEl = document.getElementById(`${id}-dm-app`)
  const bpConfig = panelConfig[breakpoint]
  const CloseIcon = getIconRegistry().close
  const newPanelId = `${id}-panel-${stringToKebab(panelId)}`

  const isAside = bpConfig.slot === 'side' && bpConfig.initiallyOpen
  const isDialog = !isAside && bpConfig.dismissable
  const isModal = bpConfig.modal === true
  const isDismissable = bpConfig.dismissable === true
  const shouldFocus = Boolean(isModal || props?.triggeringElement)

  const buttonContainerEl = bpConfig.slot.endsWith('button') ? props?.triggeringElement?.parentNode : undefined
  const mainRef = layoutRefs.mainRef
  const panelRef = useRef(null)

  const handleClose = () => {
    requestAnimationFrame(() => {
      (props?.triggeringElement || layoutRefs.viewportRef.current).focus?.()
    })
    dispatch({ type: 'CLOSE_PANEL', payload: panelId })
  }

  useModalPanelBehaviour({mainRef, panelRef, isModal, isAside, rootEl, buttonContainerEl, handleClose })
  
  useEffect(() => {
    if (shouldFocus) {
      panelRef.current.focus()
    }
  }, [])

  return (
    <div
      ref={panelRef}
      id={newPanelId}
      aria-labelledby={`${newPanelId}-label`}
      tabIndex={shouldFocus ? -1 : undefined}
      role={isDialog ? 'dialog' : isDismissable ? 'complementary' : 'region'}
      aria-modal={isDialog && isModal ? 'true' : undefined}
      style={bpConfig.width ? { width: bpConfig.width } : undefined}
      className={`dm-c-panel${isModal ? ` dm-c-panel--${bpConfig.slot}` : ''}`}
    >
      <h2
        id={`${newPanelId}-label`}
        className={panelConfig.showLabel ? 'dm-c-panel__heading dm-e-heading-m' : 'dm-u-visually-hidden'}
      >
        {panelConfig.label}
      </h2>

      {isDismissable && (
        <button
          aria-label={`Close ${panelConfig.label}`}
          className='dm-c-panel__close'
          onClick={handleClose}
        >
          <CloseIcon aria-hidden='true' focusable='false' />
        </button>
      )}

      <div className='dm-c-panel__body'>
        {WrappedChild ? <WrappedChild {...props} /> : children}
      </div>
    </div>
  )
}
