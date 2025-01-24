import React from 'react'
import { useApp } from '../store/use-app'
import Tooltip from './tooltip.jsx'

export default function Pan () {
    const { options } = useApp()
    const { id } = options

    const handleMouseDown = e => {
        e.target.blur()
        console.log(document.activeElement)
    }

    return (
        <Tooltip id={`${id}-pan-label`} cssModifier='location' position='left' text='Pan the map'>
            <button onMouseDown={handleMouseDown} className='fm-c-btn fm-c-btn--pan govuk-body-s' aria-labelledby={`${id}-pan-label`} aria-controls={`${id}-viewport`} />
        </Tooltip>
    )
}
