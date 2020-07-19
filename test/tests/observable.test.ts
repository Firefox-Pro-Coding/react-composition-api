import { observable } from '../../src'
import { isObservable } from 'mobx'

test('observable', () => {
  const state = observable({
    count: 1,
  })

  const state2 = observable.map({
    count: 1,
  })

  expect(isObservable(state)).toBe(true)
  expect(isObservable(state2)).toBe(true)

  expect(state.count).toBe(1)
  expect(state2.get('count')).toBe(1)
})
