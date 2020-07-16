import React from 'react'
import {
  defineComponent,
  reaction,
  when,
  autorun,
  onMounted,
} from '../../src'

interface Props {
  state: { count: number }
}

export const Reaction = defineComponent((props: Props) => {
  reaction(
    () => props.state.count,
    () => {
      console.log('count is', props.state.count)
    },
  )

  return () => <div />
})

export const When = defineComponent((props: Props) => {
  when(
    () => props.state.count === 3,
    () => {
      console.log('count is', props.state.count)
    },
  )

  return () => <div />
})


export const Autorun = defineComponent((props: Props) => {
  autorun(
    () => {
      console.log('count is', props.state.count)
    },
  )

  return () => <div />
})


export const ReactionInMounted = defineComponent((props: Props) => {
  onMounted(() => {
    reaction(
      () => props.state.count,
      () => {
        console.log('count is', props.state.count)
      },
    )
  })

  return () => <div />
})
