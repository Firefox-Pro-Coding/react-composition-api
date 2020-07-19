import React from 'react'
import { cleanup, render } from '@testing-library/react'
import {
  defineComponent,
  runHook,
} from '../../src'

interface Props {
  count: number
}

afterEach(cleanup)

test('runHook simple', () => {
  const RunHookSimple = defineComponent((props: Props) => {
    runHook(() => {
      console.log('props.count is', props.count)
    })

    return () => <div />
  })

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


test('runHook useEffect', () => {
  const RunHookUseEffect = defineComponent(() => {
    runHook(() => {
      React.useEffect(() => {
        console.log('mounted')
        return () => {
          console.log('unmounted')
        }
      }, [])
    })

    return () => <div />
  })

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
