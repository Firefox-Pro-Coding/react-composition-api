import React from 'react'
import { observable } from 'mobx'
import { cleanup, render } from '@testing-library/react'
import {
  defineComponent,
  reaction,
  when,
  autorun,
  onMounted,
} from '../../src'

interface Props {
  state: { count: number }
}

afterEach(cleanup)

test('reaction', () => {
  const Reaction = defineComponent((props: Props) => {
    reaction(
      () => props.state.count,
      () => {
        console.log('count is', props.state.count)
      },
    )

    return () => <div />
  })

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


test('when', () => {
  const When = defineComponent((props: Props) => {
    when(
      () => props.state.count === 3,
      () => {
        console.log('count is', props.state.count)
      },
    )

    return () => <div />
  })

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


test('autorun', () => {
  const Autorun = defineComponent((props: Props) => {
    autorun(
      () => {
        console.log('count is', props.state.count)
      },
    )

    return () => <div />
  })

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


test('reaction in mounted', () => {
  const ReactionInMounted = defineComponent((props: Props) => {
    onMounted(() => {
      reaction(
        () => props.state.count,
        () => {
          console.log('count is', props.state.count)
        },
      )
    })

    return () => <div />
  })

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
