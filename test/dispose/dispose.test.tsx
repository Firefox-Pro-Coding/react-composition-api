import React from 'react'
import { observable } from 'mobx'
import { cleanup, render } from '@testing-library/react'
import { Autorun, Reaction, When, ReactionInMounted } from './dispose'

afterEach(cleanup)

test('Reaction', () => {
  const log = jest.fn()
  global.console.log = log
  const state = observable({
    count: 1,
  })

  const component = render(
    <Reaction state={state} />,
  )

  state.count = 2
  expect(log).toBeCalledWith('count is', 2)

  state.count = 3
  expect(log).toBeCalledWith('count is', 3)

  component.unmount()

  state.count = 4
  expect(log).toBeCalledTimes(2)
})


test('When', () => {
  const log = jest.fn()
  global.console.log = log
  const state = observable({
    count: 1,
  })

  const component = render(
    <When state={state} />,
  )

  state.count = 2
  expect(log).toBeCalledTimes(0)

  state.count = 3
  expect(log).toBeCalledWith('count is', 3)

  component.unmount()

  state.count = 4
  expect(log).toBeCalledTimes(1)
})


test('Autorun', () => {
  const log = jest.fn()
  global.console.log = log
  const state = observable({
    count: 1,
  })

  const component = render(
    <Autorun state={state} />,
  )
  expect(log).toBeCalledWith('count is', 1)

  state.count = 2
  expect(log).toBeCalledWith('count is', 2)

  state.count = 3
  expect(log).toBeCalledWith('count is', 3)

  component.unmount()

  state.count = 4
  expect(log).toBeCalledTimes(3)
})


test('ReactionInMounted', () => {
  const log = jest.fn()
  global.console.log = log
  const state = observable({
    count: 1,
  })

  const component = render(
    <ReactionInMounted state={state} />,
  )

  state.count = 2
  expect(log).toBeCalledWith('count is', 2)

  component.unmount()

  state.count = 3
  expect(log).toBeCalledWith('count is', 3)
  expect(log).toBeCalledTimes(2)
})
