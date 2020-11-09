# react-composition-api

[![version](https://img.shields.io/github/package-json/v/Firefox-Pro-Coding/react-composition-api.svg?style=flat-square)](https://greasyfork.org/zh-CN/scripts/6303-iciba)
[![license](https://img.shields.io/badge/license-MIT-green.svg?longCache=true&style=flat-square)](LICENSE)
![David](https://img.shields.io/david/Firefox-Pro-Coding/react-composition-api.svg?style=flat-square)
![David](https://img.shields.io/david/dev/Firefox-Pro-Coding/react-composition-api.svg?style=flat-square)
[![Coverage](https://img.shields.io/codecov/c/github/Firefox-Pro-Coding/react-composition-api?style=flat-square)](https://codecov.io/gh/Firefox-Pro-Coding/react-composition-api)

> Using React + Mobx with composition api style! 🙌  

- [Install](#install)
- [Usage](#usage)
- [Babel Plugin](#babel-plugin)
- [Api Reference](#api-reference)
- [Tips](#tips)

Using mobx + react, you can write React components in composition api with this lib. Zero dependency and less than 2kb gzip!


## Install
```sh
# react 16.8 is required for hooks
# mobx and mobx-react-lite is required for reactivity
yarn add react mobx mobx-react-lite
yarn add @firefox-pro-coding/react-composition-api
```

## Usage
```tsx
const Component = defineComponent((props) => {
  const state = observable({ count: 1 })
  const add = action(() => { state.count += 1 })

  return () => (
    <div>
      hello world! {state.count}
      <button onClick={add}>add</button>
    </div>
  )
})
```
another [`counter example`](docs/counter.md)  

Pass a `setupFunction` to `defineComponent` to create a Component.  

`setupFunction` will run once per component and the render funtion it returns is used for rendering if any of it's dependencies changes.

`props` is a [shallow reactive object](https://mobx.js.org/refguide/api.html#decorators) for the props that the parent pass to it, you can use `reaction` to watch changes on props.

You can't use any react hooks directly in the setupFunction, as it will only run once. If any hooks are used, you will have problems about react complaining rendering fewer hooks etc.

### Benefits
- better component logic composition
- setup only execute once, less gc pressure
- little hooks involved, reduce some boilerplate

## Babel Plugin
Normally, you need to tear down mobx `reaction` watchers when component unmounted. You can import these reactivity utilities wrappers from `@firefox-pro-coding/react-composition-api`, or use the babel plugin to transform imports from `mobx` to this package.

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

## Api Reference
- **defineComponent**  
  ```jsx
  const Component = definedComponent((props) => () => {
    // props is shallow reactive
    // define your state actions in here

    // the render function used to render the component
    // will be wrapped in mobx.observer automatically
    return () => (
      <div>component</div>
    )
  })
  ```
  Pass a `setupFunction` to defineComponent to create a component. setupFunction should return a render function that receives no arguments and returns JSX.  

  setupFunction receive `props` as it's argument. `props` is a stable reference and made shallow reactive, so you can use mobx reactions to watch changes on props.

- **observable, reaction, autorun, when**  
  These are wrappers of mobx api and do exactly the same thing as the same name in mobx, except when called inside the setupFunction synchronously, and will be automatically disposed when component unmount.  

  Use the babel plugin to auto transform these imports from mobx to this package.

- **onMounted, onUnmounted**  
  ```ts
  onMounted(() => { console.log('mounted') })
  onUnmounted(() => { console.log('unmounted') })
  ```
  Life Cycle hooks when the component mounted and unmounted.  

  Callback are wrapped in `React.useEffect` hook, so using onMounted and onUnmounted is the same as React.useEffect with an empty array as deps, except it's allowed to be used inside if statement, and the order doesn't matter.  

  Reactions won't be auto torn down in life cycle hooks.  

  Tips: You can call `onUnmounted` inside `onMounted` synchronously.

- **onUpdated**  
  ```ts
  onUpdated(() => { console.log('updated') })
  ```
  Life Cycle hooks when component render completes.  
  ```tsx
  onUpdated(cb)
  // basically same as
  React.useEffect(() => {
    cb()
  }, [])
  ```


- **runhook**  
  ```ts
  const state = observable({
    value: 0,
  })

  runHook(() => {
    const newValue = React.useContext(MyContext)
    state.value = newValue
  })
  ```
  Callback passes to `runHook` will run every time before the component renders, just like normal hooks. Regular hook rules applies here.  

  To react to changes, modify the state inside the callback. Normal hooks rules apply here, so you cant call hooks inside if statement.

  What's the difference of `runHook` and `onUpdated`? You can think them of as this:
  ```ts
  const Component = () => {
    executeRunHook()
    React.useEffect(() => {
      executeOnUpdated()
    })
  }
  ```


## Tips
Want to learn more about composition api? Check out vue composition api RFC https://vue-composition-api-rfc.netlify.app/  

If you are using fast refresh in development, and wish states to preserve when component was changed and hot reloaded, all the states that preserve must be in a observable, because observable calls were cached when hot reload, and others were not.
```tsx
const Component = defineComponent(() => {
  // rootRef will be a new ref with current as null when component hot reloaded
  const rootRef = React.createRef<HTMLDivElement>(),

  return () => (
    <div ref={rootRef}>root</div>
  )
})

const Component = defineComponent(() => {
  // state.rootRef will still be the same value as before hot reload
  const state = observable({
    rootRef: React.createRef<HTMLDivElement>(),
  }, { rootRef: observable.shallow })

  return () => (
    <div ref={state.rootRef}>root</div>
  )
})
```
