import React from 'react'
import { cleanup, render } from '@testing-library/react'
import {
  defineComponent,
} from '../../src'
import { reaction } from 'mobx'

afterEach(cleanup)

/**
 * function react props are non configurable since mobx 6?
 * with leads error to mobx when trying re assign it
 */
test('props with function', () => {
  interface Props {
    f: () => void
  }
  const Basic = defineComponent((props: Props) => {
    reaction(
      () => props.f,
      () => { props.f() },
      { fireImmediately: true },
    )
    return () => null
  })

  const log = jest.fn()
  global.console.log = log

  const component = render(
    <Basic f={() => { console.log(1) }} />,
  )
  expect(log).toBeCalledWith(1)

  component.rerender(
    <Basic f={() => { console.log(2) }} />,
  )
  expect(log).toBeCalledWith(2)

  component.rerender(
    <Basic f={() => { console.log(3) }} />,
  )
  expect(log).toBeCalledWith(3)

  component.unmount()
  expect(log).toBeCalledTimes(3)
})
