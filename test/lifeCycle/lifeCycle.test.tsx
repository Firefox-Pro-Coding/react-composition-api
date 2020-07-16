import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { Basic, NestedOnUmounted } from './lifeCycle'

import 'mobx-react-lite/batchingOptOut'

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
})
