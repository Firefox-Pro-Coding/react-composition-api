import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { RunHookSimple, RunHookOriginalProps, RunHookUseEffect } from './runHook'

import 'mobx-react-lite/batchingOptOut'

afterEach(cleanup)

Error.stackTraceLimit = 20

test('RunHookSimple', () => {
  const log = jest.fn()
  global.console.log = log
  const component = render(
    <RunHookSimple count={1} />,
  )

  expect(log).toBeCalledWith('props.count is', 1)

  component.rerender(
    <RunHookSimple count={2} />,
  )

  // props render once, observable props render once
  // https://github.com/mobxjs/mobx-react-lite/issues/289#issuecomment-635426611
  expect(log).toBeCalledWith('props.count is', 2)
  expect(log).toBeCalledWith('props.count is', 2)

  component.unmount()
  expect(log).toBeCalledTimes(3)
})

test('RunHookOriginalProps', () => {
  const log = jest.fn()
  global.console.log = log
  const component = render(
    <RunHookOriginalProps count={1} />,
  )

  expect(log).toBeCalledWith('props.count is', 1)

  component.rerender(
    <RunHookOriginalProps count={2} />,
  )

  expect(log).toBeCalledWith('props.count is', 2)

  component.unmount()
  expect(log).toBeCalledTimes(2)
})

test('RunHookUseEffect', () => {
  const log = jest.fn()
  global.console.log = log
  const component = render(
    <RunHookUseEffect />,
  )

  expect(log).toBeCalledWith('mounted')

  component.unmount()

  expect(log).toBeCalledWith('unmounted')
  expect(log).toBeCalledTimes(2)
})
