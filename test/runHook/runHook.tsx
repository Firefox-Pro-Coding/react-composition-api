import React from 'react'
import {
  defineComponent,
  runHook,
  getOriginalProps,
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


export const RunHookOriginalProps = defineComponent((props: Props) => {
  runHook(() => {
    const op = getOriginalProps(props)
    console.log('props.count is', op.count)
  })

  return () => {
    const op = getOriginalProps(props)
    return (
      <div>
        hi: {op.count}
      </div>
    )
  }
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
