import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { RunHookSimple, RunHookUseEffect } from './runHook'

afterEach(cleanup)

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
