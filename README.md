# Redux Sync

Sync [middleware](https://redux.js.org/advanced/middleware) for Redux.

## Motivation

Redux Sync
[middleware](https://github.com/reactjs/redux/blob/master/docs/advanced/Middleware.md)
allows you to write action creators that return an object containing an async function and a 'lock'
The lock is used to make sure that all functions dispatched with the same lock are executed sequentially.

An action creator that returns a function to perform asynchronous dispatch:

```js
const INCREMENT_COUNTER = 'INCREMENT_COUNTER';

function appendMessage(message) {
  return {
    type: APPEND_MESSAGE,
    message
  };
}

function timeout(time) {
    return new Promise(res => {
        setTimeout(() => {
            res();
        }, time);
    });
}

function lockedAppendMessage(time, message) {
  return { 
    lock: 'INCREMENT',
    function: async (dispatch) => {
        await timeout(time);
        // Yay! Can invoke sync or async actions with `dispatch`
        dispatch(appendMessage(message));
    };
  }
}

lockedAppendMessage(10000, '1')
lockedAppendMessage(0, '2')

//If the state of the message started as '', it will always be '12'
```

A more interesting use case would be to synchronize network call to avoid inconsistent state
in your backend ...

## Composition

Any return value from the inner function will be available as the return value
of `dispatch` itself. This is convenient for orchestrating an asynchronous
control flow with thunk action creators dispatching each other and returning
Promises to wait for each other’s completion:

## License

MIT