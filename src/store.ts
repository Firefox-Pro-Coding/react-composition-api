import * as mobx from 'mobx'

export type CallBackFunction = () => unknown

export interface ComponentStore {
  disposes: Array<mobx.IReactionDisposer>
  hooks: Array<CallBackFunction>
  userHooks: Array<CallBackFunction>
  mounted: Array<CallBackFunction>
  unmounted: Array<CallBackFunction>
  updated: Array<CallBackFunction>
  mountedStage: boolean
}

export const store = {
  current: null as null | ComponentStore,
}

export const insideSetup = () => !!store.current
