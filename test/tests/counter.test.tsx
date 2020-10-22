import React from 'react'
import { action } from 'mobx'
import { cleanup, render } from '@testing-library/react'
import {
  defineComponent,
  onMounted,
  onUnmounted,
  reaction,
  observable,
} from '../../src'

afterEach(cleanup)


test('counter', async () => {
  const Component = defineComponent(() => {
    const state = observable({
      count: 0,
    })

    // life cycle hooks
    onMounted(() => { console.log('mounted') })
    onUnmounted(() => { console.log('unmounted') })

    // observation
    reaction(
      () => state.count,
      () => { console.log('new value is', state.count) },
      { fireImmediately: true },
    )

    // methods
    const handleAdd = action(() => { state.count += 1 })
    const handleSub = action(() => { state.count -= 1 })

    // render function
    return () => (
      <div>
        <div>{state.count}</div>
        <button onClick={handleAdd}>add</button>
        <button onClick={handleSub}>sub</button>
      </div>
    )
  })

  const log = jest.fn()
  global.console.log = log
  const component = render(
    <Component />,
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


test('counter 2', async () => {
  const Component = defineComponent(() => {
    const state = observable.map({
      count: 0,
    })

    // life cycle hooks
    onMounted(() => { console.log('mounted') })
    onUnmounted(() => { console.log('unmounted') })

    // observation
    reaction(
      () => state.get('count'),
      () => { console.log('new value is', state.get('count')) },
      { fireImmediately: true },
    )

    // methods
    const handleAdd = action(() => {
      state.set('count', state.get('count')! + 1)
    })

    const handleSub = action(() => {
      state.set('count', state.get('count')! - 1)
    })

    // render function
    return () => (
      <div>
        <div>{state.get('count')}</div>
        <button onClick={handleAdd}>add</button>
        <button onClick={handleSub}>sub</button>
      </div>
    )
  })

  const log = jest.fn(console.log)
  global.console.log = log
  const component = render(
    <Component />,
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
