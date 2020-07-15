import React from 'react'
import * as mobx from 'mobx'
import { observer } from 'mobx-react-lite'

type CallBackFunction = () => unknown

interface ComponentStore {
  disposes: Array<mobx.IReactionDisposer>
  hooks: Array<CallBackFunction>
  mounted: Array<CallBackFunction>
  unmounted: Array<CallBackFunction>
}

let currentComponentStore: null | ComponentStore = null

const insideSetup = () => !!currentComponentStore

const checkInsideSetup = (name: string) => {
  if (!insideSetup()) {
    throw new Error(`${name} is only allow to be called inside setup function.`)
  }
}


const pushDispose = (dispose: mobx.IReactionDisposer) => {
  if (currentComponentStore !== null) {
    currentComponentStore.disposes.push(dispose)
  }
}


/**
 * callback is executed on each render. you can use hooks inside callback.
 * despite it's name, you can put arbitrary code in here.
 */
export const runHook = <T extends unknown>(fn: () => T) => {
  checkInsideSetup('runHook')
  const r = fn()
  currentComponentStore!.hooks.push(fn)
  return r
}


/**
 * callback is executed when component is mounted.
 */
export const onMounted = (cb: CallBackFunction) => {
  checkInsideSetup('onMounted')
  currentComponentStore!.mounted.push(cb)
}

/**
 * callback is executed when component is unmounted.
 */
export const onUnmounted = (cb: CallBackFunction) => {
  checkInsideSetup('onUnmounted')
  currentComponentStore!.unmounted.push(cb)
}


export const observable = ((...args: Parameters<typeof mobx.observable>) => {
  if (insideSetup()) {
    const hook = () => React.useRef<unknown>(null)
    const ref = hook()
    if (!ref.current) {
      ref.current = mobx.observable(...args)
    }

    currentComponentStore?.hooks.push(hook)
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
      currentComponentStore?.hooks.push(hook)
      return ref.current
    }
    return (mobx.observable[key] as any)(...args)
  }) as any
})


export const reaction = (...args: Parameters<typeof mobx.reaction>) => {
  const dispose = mobx.reaction(...args)
  pushDispose(dispose)
}


export const autorun = (...args: Parameters<typeof mobx.autorun>) => {
  const dispose = mobx.autorun(...args)
  pushDispose(dispose)
}


export const when = (...args: Parameters<typeof mobx.when>) => {
  const dispose = mobx.when(...args)
  pushDispose(dispose)
}

/**
 * create component from setupFunction.
 * https://github.com/Firefox-Pro-Coding/react-composition-api#api-reference
 * @param setup - recieve a shallow reactive props as argument, returns a render function
 */
export const defineComponent = <P extends unknown>(setup: (p: P) => React.FunctionComponent) => {
  const Component = observer((newProps: any) => {
    const propsRef = React.useRef<any>(null)
    if (propsRef.current === null) {
      propsRef.current = mobx.observable({}, {}, { deep: false })
    }

    const currentProps = propsRef.current
    const currentPropsKeys = mobx.keys(currentProps) as Array<string>
    const newPropsKeys = Object.keys(newProps)
    const deleteKeys = currentPropsKeys.filter((v) => !newPropsKeys.includes(v))

    deleteKeys.forEach((key) => {
      mobx.remove(currentProps, key)
    })

    newPropsKeys.forEach((key) => {
      if (newProps[key] !== currentProps[key]) {
        mobx.set(currentProps, key, newProps[key])
      }
    })

    const cachedSetup = React.useRef<unknown>(null)
    const component = React.useRef<any>(null)

    const componentStore = React.useRef<ComponentStore>({
      hooks: [],
      disposes: [],
      mounted: [],
      unmounted: [],
    })

    const nextComponentStore = React.useRef<ComponentStore | null>(null)

    React.useEffect(() => {
      if (nextComponentStore.current) {
        componentStore.current = nextComponentStore.current
        nextComponentStore.current = null
      }
      currentComponentStore = componentStore.current
      componentStore.current.mounted.forEach((v) => v())
      currentComponentStore = null
      return () => {
        componentStore.current.disposes.forEach((v) => v())
        componentStore.current.disposes = []
        componentStore.current.unmounted.forEach((v) => v())
      }
    }, [])

    if (!component.current || (cachedSetup.current !== null && cachedSetup.current !== setup)) {
      componentStore.current.disposes.forEach((v) => v())
      componentStore.current.disposes = []
      nextComponentStore.current = {
        hooks: [],
        disposes: [],
        mounted: [],
        unmounted: [],
      }
      currentComponentStore = nextComponentStore.current
      cachedSetup.current = setup
      component.current = setup(propsRef.current)
    } else {
      componentStore.current.hooks.forEach((v) => v())
    }

    if (nextComponentStore.current) {
      componentStore.current = nextComponentStore.current
      nextComponentStore.current = null
    }

    currentComponentStore = null

    return component.current()
  })

  return Component as React.FunctionComponent<P>
}
