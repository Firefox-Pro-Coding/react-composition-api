import React from 'react'
import {
  defineComponent,
  onMounted,
  onUnmounted,
} from '../../src'

export const Basic = defineComponent(() => {
  onMounted(() => {
    console.log('mounted')
  })

  onUnmounted(() => {
    console.log('unmounted')
  })

  return () => {
    console.log('render')
    return (
      <div>
        hi
      </div>
    )
  }
})

export const NestedOnUmounted = defineComponent(() => {
  onMounted(() => {
    console.log('mounted')

    onUnmounted(() => {
      console.log('unmounted')
    })
  })

  return () => {
    console.log('render')
    return (
      <div>
        hi
      </div>
    )
  }
})
