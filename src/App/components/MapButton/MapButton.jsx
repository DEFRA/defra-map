// components/MapButton.jsx
import { stringToKebab } from '../../../utils/stringToKebab'
import { Tooltip } from '../Tooltip/Tooltip'
import { Icon } from '../Icon/Icon'
import { SlotRenderer } from '../../renderer/SlotRenderer'
import { useConfig } from '../../store/configContext'
import { useApp } from '../../store/appContext'

export const MapButton = ({
  buttonId,
  iconId,
  iconSvgContent,
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
  idPrefix,
  href,
  groupMiddle,
  groupStart,
  groupEnd
}) => {
  const { id: appId } = useConfig()
  const { buttonRefs } = useApp()

  const buttonClassNames = [
    'dm-c-map-button',
    buttonId && `dm-c-map-button--${stringToKebab(buttonId)}`,
    variant && `dm-c-map-button--${variant}`,
    showLabel && 'dm-c-map-button--with-label'
  ].filter(Boolean).join(' ')

  const Element = href ? 'a' : 'button'

  const handleKeyUp = (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault() // prevent page scrolling
      e.currentTarget.click() // trigger click
    }
  }

  const buttonProps = {
    id: `${appId}-${stringToKebab(buttonId)}`,
    className: buttonClassNames,
    onClick,
    ref: (el) => buttonRefs.current && buttonId ? buttonRefs.current[buttonId] = el : null,
    'aria-disabled': isDisabled || undefined,
    'aria-expanded': typeof isExpanded === 'boolean' ? isExpanded : undefined,
    'aria-pressed': panelId ? (isOpen ? 'true' : 'false') : isPressed,
    'aria-controls': panelId ? `${idPrefix}-panel-${stringToKebab(panelId)}` : undefined,
    ...(href 
      ? { href, target: '_blank', onKeyUp: handleKeyUp, role: 'button' } // only <a>
      : { type: 'button' } // only <button>
    )
  }

  const buttonEl = (
    <Element {...buttonProps}>
      {(iconId || iconSvgContent) && <Icon id={iconId} svgContent={iconSvgContent} />}
      {showLabel && <span>{label}</span>}
    </Element>
  )

  const wrapperClassNames = [
    'dm-c-button-wrapper',
    showLabel && ' dm-c-button-wrapper--wide',
    groupStart && `dm-c-button-wrapper--group-start`,
    groupMiddle && `dm-c-button-wrapper--group-middle`,
    groupEnd && `dm-c-button-wrapper--group-end`
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClassNames} style={isHidden ? { display: 'none'} : undefined}>
      {showLabel ? buttonEl : <Tooltip content={label}>{buttonEl}</Tooltip>}
      {panelId && <SlotRenderer slot={`${stringToKebab(buttonId)}-button`} />}
    </div>
  )
}
