import React from 'react'
import {
  defineComponent,
  runHook,
} from '../../src'

interface Props {
  count: number
}

export const RunHookSimple = defineComponent((props: Props) => {
  runHook(() => {
    console.log('props.count is', props.count)
  })

  return () => <div />
})


export const RunHookUseEffect = defineComponent(() => {
  runHook(() => {
    React.useEffect(() => {
      console.log('mounted')
      return () => {
        console.log('unmounted')
      }
    }, [])
  })

  return () => <div />
})
