# PaveReact

A higher-order React component (HoC) to help with common Pave patterns.

## Install

```bash
npm install pave-react
```

## Usage

```
import {render} from 'react-dom';
import {withPave} from 'pave-react';
import store from './my-pave-store';

const User = withPave(
  ({pave: {cache: {user}, isLoading}}) =>
    <div>
      {isLoading ? 'Loading...' : null}
      {user ? `Hello ${user.name}!` : null}
    </div>,
  {
    getQuery: ({props: {userId}}) => ['usersById', userId],
    getCache: ({props: {userId}, store}) => ({
      user: store.get(['usersById', userId])
    })
  }
);

render(<User paveStore={store} userId={123} />, document.body);
```
