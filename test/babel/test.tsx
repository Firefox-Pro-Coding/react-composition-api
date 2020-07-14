import React from 'react';
import { observable, reaction } from 'mobx';
import * as mobx from 'mobx';
import { defineComponent } from '@firefox-pro-coding/react-composition-api';

import './index.local.sass';

console.log(mobx)

interface Props {
  count: number
  info?: string
}

export const App = defineComponent((props: Props) => {
  const state = observable({
    count: props.count,
    logs: [] as Array<string>,
  });

  reaction(
    () => props.count,
    () => {
      state.count = props.count;
      state.logs = [];
    },
    { fireImmediately: true },
  );

  return () => (
    <div>
      hi
    </div>
  );
});
