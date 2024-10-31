import React from 'react'

export default function Keyboard () {
  return (
    <dl className='fm-c-keyboard-list govuk-body-s'>
      <div className='fm-u-visually-hidden'>
        <dt>Get location information</dt>
        <dd><kbd>Alt</kbd> + <kbd>I</kbd></dd>
      </div>
      <div className='fm-c-keyboard-list__item'>
        <dt>Move in large steps</dt>
        <dd><kbd>&larr;</kbd>, <kbd>&uarr;</kbd>, <kbd>&rarr;</kbd> or <kbd>&darr;</kbd></dd>
      </div>
      <div className='fm-c-keyboard-list__item'>
        <dt>Move in small steps</dt>
        <dd><kbd>Shift</kbd> + <kbd>&larr;</kbd>, <kbd>&uarr;</kbd>, <kbd>&rarr;</kbd> or <kbd>&darr;</kbd></dd>
      </div>
      <div className='fm-c-keyboard-list__item'>
        <dt>Adjust zoom level</dt>
        <dd><kbd>+</kbd> or <kbd>=</kbd> and <kbd>-</kbd> or <kbd>_</kbd></dd>
      </div>
      <div className='fm-c-keyboard-list__item'>
        <dt>Select a feature</dt>
        <dd><kbd>Page Up</kbd> and <kbd>Page Down</kbd></dd>
      </div>
      <div className='fm-c-keyboard-list__item'>
        <dt>Get feature information</dt>
        <dd><kbd>Enter</kbd></dd>
      </div>
    </dl>
  )
}
