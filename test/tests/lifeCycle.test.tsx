import React from 'react'
import { cleanup, render } from '@testing-library/react'
import {
  defineComponent,
  onMounted,
  onUpdated,
  onUnmounted,
} from '../../src'

afterEach(cleanup)

test('Basic', () => {
  const Basic = defineComponent(() => {
    onMounted(() => {
      console.log('mounted')
    })

    onUnmounted(() => {
      console.log('unmounted')
    })

    return () => {
      console.log('render')
      return (
        <div>
          hi
        </div>
      )
    }
  })

  const log = jest.fn()
  global.console.log = log
  const component = render(
    <Basic />,
  )
  expect(log).toBeCalledWith('mounted')
  expect(log).toBeCalledWith('render')
  component.unmount()
  expect(log).toBeCalledWith('unmounted')
  expect(log).toBeCalledTimes(3)
})


test('nested on unmounted', () => {
  const NestedOnUmounted = defineComponent(() => {
    onMounted(() => {
      console.log('mounted')

      onUnmounted(() => {
        console.log('unmounted')
      })
    })

    return () => {
      console.log('render')
      return (
        <div>
          hi
        </div>
      )
    }
  })

  const log = jest.fn()
  global.console.log = log
  const component = render(
    <NestedOnUmounted />,
  )
  expect(log).toBeCalledWith('mounted')
  expect(log).toBeCalledWith('render')
  component.unmount()
  expect(log).toBeCalledWith('unmounted')
  expect(log).toBeCalledTimes(3)
})


test('outside defineComponent', () => {
  expect(onMounted).toThrow('onMounted is only allow to be called inside setup function.')
  expect(onUpdated).toThrow('onUpdated is only allow to be called inside setup function.')
  expect(onUnmounted).toThrow('onUnmounted is only allow to be called inside setup function.')
})
