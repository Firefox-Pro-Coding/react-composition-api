import React from 'react'
import { observer } from 'mobx-react-lite'
import * as mobx from 'mobx'

type CallBackFunction = () => unknown

interface ComponentStore {
  disposes: Array<mobx.IReactionDisposer>
  hooks: Array<CallBackFunction>
  subHooks: Array<CallBackFunction>
  mounted: Array<CallBackFunction>
  unmounted: Array<CallBackFunction>
  updated: Array<CallBackFunction>
  mountedStage: boolean
}

let currentStore: null | ComponentStore = null

const insideSetup = () => !!currentStore

const checkInsideSetup = (name: string) => {
  if (!insideSetup()) {
    throw new Error(`${name} is only allow to be called inside setup function.`)
  }
}


const pushDispose = (dispose: mobx.IReactionDisposer) => {
  if (currentStore !== null && !currentStore.mountedStage) {
    currentStore.disposes.push(dispose)
  }
}


/**
 * callback is executed on each render. you can use hooks inside callback.
 * despite it's name, you can put arbitrary code in here.
 */
export const runHook = <T extends unknown>(fn: () => T) => {
  checkInsideSetup('runHook')
  currentStore!.subHooks.push(fn)
}


/**
 * callback is executed when component is mounted.
 */
export const onMounted = (cb: CallBackFunction) => {
  checkInsideSetup('onMounted')
  currentStore!.mounted.push(cb)
}

/**
 * callback is executed when component is unmounted.
 */
export const onUnmounted = (cb: CallBackFunction) => {
  checkInsideSetup('onUnmounted')
  currentStore!.unmounted.push(cb)
}


/**
 * callback is executed when component is updated.
 */
export const onUpdated = (cb: CallBackFunction) => {
  checkInsideSetup('onUpdated')
  currentStore!.updated.push(cb)
}


export const observable = ((...args: Parameters<typeof mobx.observable>) => {
  if (insideSetup()) {
    const hook = () => React.useRef<unknown>(null)
    const ref = hook()
    if (!ref.current) {
      ref.current = mobx.observable(...args)
    }

    currentStore!.hooks.push(hook)
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
      currentStore!.hooks.push(hook)
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

/**
 * create component from setupFunction.
 * https://github.com/Firefox-Pro-Coding/react-composition-api#api-reference
 * @param setup - recieve a shallow reactive props as argument, returns a render function
 */
export const defineComponent = <P extends unknown>(
  setup: (p: P) => React.FunctionComponent,
) => {
  const Component = (newProps: any) => {
    const propsRef = React.useRef<any>(null)
    let firstRender = false
    if (propsRef.current === null) {
      propsRef.current = mobx.observable(newProps, {}, { deep: false })
      firstRender = true
    }

    React.useEffect(() => {
      mobx.runInAction(() => {
        if (firstRender) {
          return
        }
        const currentProps = propsRef.current
        const currentPropsKeys = mobx.keys(currentProps) as Array<string>
        const newPropsKeys = Object.keys(newProps)
        const deleteKeys = currentPropsKeys.filter((v) => !newPropsKeys.includes(v))

        Object.assign(propsRef.current, newProps)

        deleteKeys.forEach((key) => {
          mobx.remove(currentProps, key)
        })
      })
    })

    const cachedSetup = React.useRef<unknown>(null)
    const renderFunction = React.useRef<any>(null)
    const store = React.useRef<ComponentStore>({
      hooks: [],
      disposes: [],
      subHooks: [],
      mounted: [],
      unmounted: [],
      updated: [],
      mountedStage: false,
    })
    const nextStore = React.useRef<ComponentStore | null>(null)

    React.useEffect(() => {
      currentStore = store.current
      currentStore.mountedStage = true

      store.current.mounted.forEach((v) => v())

      currentStore.mountedStage = false
      currentStore = null

      return () => {
        store.current.disposes.forEach((v) => v())
        store.current.disposes = []
        store.current.unmounted.forEach((v) => v())
      }
    }, [])

    let renderStore = store.current

    if (!renderFunction.current || (cachedSetup.current !== null && cachedSetup.current !== setup)) {
      store.current.disposes.forEach((v) => v())
      store.current.disposes = []
      nextStore.current = {
        hooks: [],
        subHooks: [],
        disposes: [],
        mounted: [],
        unmounted: [],
        updated: [],
        mountedStage: false,
      }
      currentStore = nextStore.current
      renderStore = nextStore.current
      cachedSetup.current = setup
      renderFunction.current = setup(propsRef.current)
    } else {
      store.current.hooks.forEach((v) => v())
    }

    if (nextStore.current) {
      store.current = nextStore.current
      nextStore.current = null
    }

    const C = React.useRef<any>()
    if (!C.current) {
      C.current = observer((props: { renderStore: ComponentStore }) => {
        props.renderStore.subHooks.forEach((v: any) => v())
        React.useEffect(() => {
          renderStore.updated.forEach((v) => v())
        })
        return renderFunction.current()
      })
    }

    currentStore = null

    return (
      // eslint-disable-next-line react/jsx-pascal-case
      <C.current
        props={propsRef.current}
        renderStore={renderStore}
        key={1}
      />
    )
  }

  return Component as React.FunctionComponent<P>
}
