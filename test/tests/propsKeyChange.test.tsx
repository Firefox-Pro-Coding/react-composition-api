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
        console.log('textA', props.textA)
      },
      { fireImmediately: true },
    )

    reaction(
      () => props.textB,
      () => {
        console.log('textB', props.textB)
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
  expect(log).toBeCalledWith('textA', 'textA')
  expect(log).toBeCalledWith('textB', undefined)

  component.rerender(
    <Component {...{ textA: 'textA', textB: 'textB' }} />,
  )

  expect(log).toBeCalledWith('textB', 'textB')

  component.rerender(
    <Component {...{ textA: 'textA' }} />,
  )

  expect(log).toBeCalledWith('textB', undefined)
  expect(log).toBeCalledTimes(4)
})
