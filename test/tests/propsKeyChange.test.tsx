import React from 'react'
import { cleanup, render } from '@testing-library/react'
import {
  defineComponent,
  reaction,
} from '../../src'

afterEach(cleanup)

interface Props {
  textA: string
  textB?: string
}

test('props key change', () => {
  const Component = defineComponent((props: Props) => {
    reaction(
      () => props.textA,
      () => {
        console.log(props.textA)
      },
      { fireImmediately: true },
    )

    reaction(
      () => props.textB,
      () => {
        console.log(props.textB)
      },
      { fireImmediately: true },
    )

    // render function
    return () => <div />
  })

  const log = jest.fn()
  global.console.log = log
  const component = render(
    <Component {...{ textA: 'textA' }} />,
  )
  expect(log).toBeCalledWith('textA')
  expect(log).toBeCalledWith(undefined)

  component.rerender(
    <Component {...{ textA: 'textA', textB: 'textB' }} />,
  )

  expect(log).toBeCalledWith('textB')

  component.rerender(
    <Component {...{ textA: 'textA' }} />,
  )

  expect(log).toBeCalledWith(undefined)
  expect(log).toBeCalledTimes(4)
})
