import React from 'react'
import { observer } from 'mobx-react-lite'
import * as mobx from 'mobx'

import { store, ComponentStore } from './store'

interface State {
  props: any
  setup: null | ((...args: Array<any>) => unknown)
  render: null | (() => React.ReactElement<any, any> | null)
  store: ComponentStore
  nextStore: null | ComponentStore
  Component: null | React.FunctionComponent<any>
}

/*
 * fast refresh procedure:
 * 1. setup
 * 2. unmounted
 * 3. mounted
 */

/**
 * create component from setupFunction.
 * https://github.com/Firefox-Pro-Coding/react-composition-api#api-reference
 * @param setup - recieve a shallow reactive props as argument, returns a render function
 */
export const defineComponent = <P extends unknown>(
  setup: (p: P) => () => React.ReactElement<any, any> | null,
) => {
  const Component = (newProps: any) => {
    const stateRef = React.useRef<State | null>(null)
    if (!stateRef.current) {
      stateRef.current = {
        props: null,
        setup: null,
        render: null,
        store: {
          hooks: [],
          disposes: [],
          userHooks: [],
          mounted: [],
          unmounted: [],
          updated: [],
          mountedStage: false,
        },
        nextStore: null,
        Component: null,
      }
    }

    const state = stateRef.current

    let firstRender = false
    if (!state.props) {
      firstRender = true
      state.props = mobx.observable({}, {}, { deep: false })
      extendsProps(state.props, newProps)
    }

    React.useEffect(() => {
      // modify props
      mobx.runInAction(() => {
        if (firstRender) {
          return
        }
        extendsProps(state.props, newProps)
      })
    })

    React.useEffect(() => {
      // state.nextStore will be defined if it's a fast refresh
      if (state.nextStore) {
        state.store = state.nextStore
        state.nextStore = null
      }

      store.current = state.store
      store.current.mountedStage = true

      store.current.mounted.forEach((v) => v())

      store.current.mountedStage = false
      store.current = null

      return () => {
        state.store.disposes.forEach((v) => v())
        state.store.disposes = []
        state.store.unmounted.forEach((v) => v())
      }
    }, [])

    let renderStore = state.store

    // need to run setup
    if (!state.render || (state.setup !== null && state.setup !== setup)) {
      // dispose existed watchers when doing fast refresh
      state.store.disposes.forEach((v) => v())
      state.store.disposes = []
      state.nextStore = {
        hooks: [],
        userHooks: [],
        disposes: [],
        mounted: [],
        unmounted: [],
        updated: [],
        mountedStage: false,
      }
      store.current = state.nextStore
      renderStore = state.nextStore
      state.setup = setup
      state.render = setup(state.props)
    } else {
      // normal render
      state.store.hooks.forEach((v) => v())
    }

    if (!state.Component) {
      state.Component = observer((props: { renderStore: ComponentStore }) => {
        props.renderStore.userHooks.forEach((v: any) => v())
        React.useEffect(() => {
          renderStore.updated.forEach((v) => v())
        })
        return state.render!()
      })
    }

    store.current = null

    return (
      <state.Component
        props={state.props}
        renderStore={renderStore}
        key={1}
      />
    )
  }

  return Component as React.FunctionComponent<P>
}

const extendsProps = (props: any, newProps: any) => {
  const existedKeys = mobx.keys(props) as Array<string>
  const newKeys = Object.keys(newProps)
  const toDeletedKeys = existedKeys.filter((v) => !newKeys.includes(v))

  Object.assign(props, newProps)

  toDeletedKeys.forEach((key) => {
    mobx.remove(props, key)
  })
}
