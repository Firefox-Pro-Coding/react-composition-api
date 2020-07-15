# react-composition-api

[![version](https://img.shields.io/github/package-json/v/Firefox-Pro-Coding/react-composition-api.svg?style=flat-square)](https://greasyfork.org/zh-CN/scripts/6303-iciba)
[![license](https://img.shields.io/badge/license-MIT-green.svg?longCache=true&style=flat-square)](LICENSE)
![David](https://img.shields.io/david/Firefox-Pro-Coding/react-composition-api.svg?style=flat-square)
![David](https://img.shields.io/david/dev/Firefox-Pro-Coding/react-composition-api.svg?style=flat-square)

> Writing react component with mindset of vue composition api! 🙌  
> To learn more about the concept of composition api: https://vue-composition-api-rfc.netlify.app/

## Install
```sh
# react 16.8 is required for hooks
# mobx and mobx-react-lite is required for reactivity
yarn add react mobx mobx-react-lite
yarn add @firefox-pro-coding/react-composition-api
```

## Usage
```ts
const Component = defineComponent((props) => renderFunction)
```
Pass a setup function to `defineComponent` to create a Component.  

`setupFunction` recieve props object as argument. `props` is a [shallow reactive object](https://mobx.js.org/refguide/api.html#decorators), you can use `reaction` to watch changes on props.

Upon component per component instance creation, `setupFunction` will be running only once and should return a function accepts no argument that returns JSX. Only the returned function will be running again to generate the new virtual dom.  

Normally, you need to tear down mobx `reaction` watchers when component unmounted. If you'd like to get it automatically done, import these reactivity utilities wrappers from `@firefox-pro-coding/react-composition-api`, or use the babel plugin to transform imports from `mobx` to this package. In setupFunction, synchronized calls to mobx reactions will be detected and tear down automatically when component unmount.

```js
// using wrapper from @firefox-pro-coding/react-composition-api
import {
  observable,
  reaction,
  autorun,
  when,
} from '@firefox-pro-coding/react-composition-api'
```
```js
// or using babel to auto transform
// .babelrc.js
module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV)

  return {
    plugins: [
      '@firefox-pro-coding/react-composition-api/babel',
    ],
  }
}


// import from mobx
import { observable, autorun, when, reaction, observe } from 'mobx'
// will be transformed into
import { observe } from 'mobx'
import {
  observable,
  autorun,
  when,
  reaction,
} from '@firefox-pro-coding/react-composition-api'
```


## Counter Example
```tsx
import React from 'react'

import {
  defineComponent,
  onMounted,
  onUnmounted,
  reaction,
  observable,
} from '@firefox-pro-coding/react-composition-api'

export const App = defineComponent((_props) => {
  const state = observable({
    count: 0,
  })

  const box = React.createRef<HTMLDivElement>(null)

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
  const handleAdd = () => { state.count += 1 }
  const handleSub = () => { state.count -= 1 }

  // render function
  return () => (
    <div ref={box}>
      <div>{state.count}</div>
      <button onClick={handleAdd}>add</button>
      <button onClick={handleSub}>sub</button>
    </div>
  )
})
```

## Api Reference
- **defineComponent**
  ```jsx
  const Component = definedComponent((props) => () => {
    // props is reactive
    // setup step

    // the render function
    // will be wrapped in mobx.observer automatically
    return () => (
      <div>component</div>
    )
  })
  ```
  Pass a `setupFunction` to defineComponent to create a component. setupFunction should return a render function that recieves no arguments and returns JSX.  

  setupFunction recive `props` as it's argument. `props` is a stable reference and made shallow reactive, so you can use mobx reactions to watch changes on props.

- **observable, reaction, autorun, when**
  These are wrapper of mobx apis and do exactly the same thing as the same name in mobx, except when inside the setupFunction, and will be automatically dispose when component unmount.  

  Use the babel plugin to auto transform these imports from mobx to this package.

- **onMounted, onUnmounted**
  ```ts
  onMounted(() => { console.log('mounted') })
  onUnmounted(() => { console.log('unmounted') })
  ```
  Callbacks will be called when the component mounted and unmounted.  

  Callback are wrapped in `React.useEffect` hook, so using onMounted and onUnmounted is basically the same as React.useEffect with empty array as deps, except it is allow to use inside if statement, and the order doesn't matter.

  Tips: You can call `onUnmounted` synchronously inside `onMounted`.

- **runhook**
  ```ts
  const result = runHook(() => {
    const value = React.useContext(MyContext)
    state.contextValue = value
    return value
  })
  ```
  Callback passes to `runHook` will run every time before the component renders, just like normal hooks.  

  `runHook` return result is the return value of the callback on it's first execution, so once after first execution, `result` here is never changed. To react to changes, modify state inside the callback. Normal hooks rules apply here, so you cant call hooks inside if statement.

  Despite its name runHook, you can actually put anything inside it. It will run in every render, like in a normal functional component. putting a console.log in here is a typical way to monitoring re-renders.
