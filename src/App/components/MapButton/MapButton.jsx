// components/MapButton.jsx
import { stringToKebab } from '../../../utils/stringToKebab'
import { Tooltip } from '../Tooltip/Tooltip'
import { getIconRegistry } from '../../registry/iconRegistry.js'
import { SlotRenderer } from '../../renderer/SlotRenderer'
import { useConfig } from '../../store/configContext'

export const MapButton = ({
  buttonId,
  iconId,
  label,
  showLabel,
  isDisabled,
  isExpanded,
  isPressed,
  isHidden,
  isOpen,
  variant,
  onClick,
  panelId,
  idPrefix
}) => {
  const { id: appId } = useConfig()
  const Icon = getIconRegistry()[iconId]

  const classNames = [
    'am-c-map-button',
    buttonId && `am-c-map-button--${stringToKebab(buttonId)}`,
    variant && `am-c-map-button--${variant}`,
    showLabel && `am-c-map-button--with-label`
  ].filter(Boolean).join(' ')

  const buttonEl = (
    <button
      id={`${appId}-${stringToKebab(buttonId)}`}
      type='button'
      className={classNames}
      aria-disabled={isDisabled || undefined}
      aria-expanded={typeof isExpanded === 'boolean' ? isExpanded : undefined}
      onClick={onClick}
      // If button controls a panel then that takes priority
      aria-pressed={panelId ? (isOpen ? 'true' : 'false') : isPressed}
      aria-controls={panelId ? `${idPrefix}-panel-${stringToKebab(panelId)}` : undefined}
    >
      {Icon && <Icon aria-hidden='true' focusable='false' />}
      {showLabel && <span>{label}</span>}
    </button>
  )

  return (
    <div className={`am-c-button-wrapper${showLabel ? ' am-c-button-wrapper--wide' : ''}`} style={isHidden ? { display: 'none'} : undefined}>
      {showLabel ? buttonEl : <Tooltip content={label}>{buttonEl}</Tooltip>}
      {panelId && <SlotRenderer slot={`${stringToKebab(buttonId)}-button`} />}
    </div>
  )
}
