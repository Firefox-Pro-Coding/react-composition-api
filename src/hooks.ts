import React from 'react'
import * as mobx from 'mobx'

import { store, insideSetup, CallBackFunction } from './store'

const checkInsideSetup = (name: string) => {
  if (!insideSetup()) {
    throw new Error(`${name} is only allow to be called inside setup function.`)
  }
}


const pushDispose = (dispose: mobx.IReactionDisposer) => {
  if (store.current !== null && !store.current.mountedStage) {
    store.current.disposes.push(dispose)
  }
}


/**
 * callback is executed on each render. you can use hooks inside callback.
 * despite it's name, you can put arbitrary code in here.
 */
export const runHook = <T extends unknown>(fn: () => T) => {
  checkInsideSetup('runHook')
  store.current!.userHooks.push(fn)
}


/**
 * callback is executed when component is mounted.
 */
export const onMounted = (cb: CallBackFunction) => {
  checkInsideSetup('onMounted')
  store.current!.mounted.push(cb)
}

/**
 * callback is executed when component is unmounted.
 */
export const onUnmounted = (cb: CallBackFunction) => {
  checkInsideSetup('onUnmounted')
  store.current!.unmounted.push(cb)
}


/**
 * callback is executed when component is updated.
 */
export const onUpdated = (cb: CallBackFunction) => {
  checkInsideSetup('onUpdated')
  store.current!.updated.push(cb)
}


export const observable = ((...args: Parameters<typeof mobx.observable>) => {
  if (insideSetup()) {
    const hook = () => React.useRef<unknown>(null)
    const ref = hook()
    if (!ref.current) {
      ref.current = mobx.observable(...args)
    }

    store.current!.hooks.push(hook)
    return ref.current
  }
  return mobx.observable(...args)
}) as typeof mobx.observable

observable.shallow = mobx.observable.shallow
observable.ref = mobx.observable.ref
observable.deep = mobx.observable.deep
observable.struct = mobx.observable.struct
const observableStaticMethodFields = [
  'array',
  'box',
  'map',
  'object',
  'set',
] as const

observableStaticMethodFields.forEach((key) => {
  observable[key] = ((...args: Array<unknown>) => {
    if (insideSetup()) {
      const hook = () => React.useRef<unknown>(null)
      const ref = hook()
      if (!ref.current) {
        ref.current = (mobx.observable[key] as any)(...args)
      }
      store.current!.hooks.push(hook)
      return ref.current
    }
    return (mobx.observable[key] as any)(...args)
  }) as any
})


export const reaction: typeof mobx.reaction = (...args: Array<any>) => {
  const dispose = (mobx.reaction as any)(...args)
  pushDispose(dispose)
  return dispose
}


export const autorun: typeof mobx.autorun = (...args: Array<any>) => {
  const dispose = (mobx.autorun as any)(...args)
  pushDispose(dispose)
  return dispose
}


export const when: typeof mobx.when = (...args: Array<any>) => {
  const dispose = (mobx.when as any)(...args)
  if (typeof dispose === 'function') {
    pushDispose(dispose)
  }
  return dispose
}
