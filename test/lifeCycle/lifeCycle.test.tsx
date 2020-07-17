import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { Basic, NestedOnUmounted } from './lifeCycle'

afterEach(cleanup)

test('Basic', () => {
  const log = jest.fn()
  global.console.log = log
  const component = render(
    <Basic />,
  )
  expect(log).toBeCalledWith('mounted')
  expect(log).toBeCalledWith('render')
  component.unmount()
  expect(log).toBeCalledWith('unmounted')
  expect(log).toBeCalledTimes(3)
})


test('NestedOnUmounted', () => {
  const log = jest.fn()
  global.console.log = log
  const component = render(
    <NestedOnUmounted />,
  )
  expect(log).toBeCalledWith('mounted')
  expect(log).toBeCalledWith('render')
  component.unmount()
  expect(log).toBeCalledWith('unmounted')
  expect(log).toBeCalledTimes(3)
})
