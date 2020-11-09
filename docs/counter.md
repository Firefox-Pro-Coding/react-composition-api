
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

  const box = React.createRef<HTMLDivElement>()

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
