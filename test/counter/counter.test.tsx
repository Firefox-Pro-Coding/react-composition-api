import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { Counter } from './counter'

afterEach(cleanup)

test('Counter', async () => {
  const log = jest.fn()
  global.console.log = log
  const component = render(
    <Counter />,
  )
  expect(log).toBeCalledWith('new value is', 0)
  expect(log).toBeCalledWith('mounted')
  const countBox = await component.findByText('0')
  const add = component.getByText('add')
  const sub = component.getByText('sub')

  expect(add).toBeTruthy()
  expect(sub).toBeTruthy()
  expect(countBox).toBeTruthy()

  add.click()
  expect(countBox.textContent).toBe('1')
  expect(log).toBeCalledWith('new value is', 1)

  sub.click()
  expect(countBox.textContent).toBe('0')
  expect(log).toBeCalledWith('new value is', 0)

  component.unmount()
  expect(log).toBeCalledWith('unmounted')
  expect(log).toReturnTimes(5)
})
