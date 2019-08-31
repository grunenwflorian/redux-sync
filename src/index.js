const isMiddlewareCompatible = (action) => {
  const fn = action.function
  return !!action.lock &&
         !!fn &&
         !!fn.constructor &&
           fn.constructor.name === 'AsyncFunction'
}

const middlewareFactory = () => {
  const lockToPromise = new Map()
  return ({ dispatch, getState }) => (next) => (action) => {
    if (!isMiddlewareCompatible(action)) {
      return next(action)
    }

    const lock = action.lock
    const func = action.function

    let promise = lockToPromise.has(lock) ? lockToPromise.get(lock) : Promise.resolve()
    //Ignore any potential error, this does not affect the control of the user and ensures
    //isolation between synchronized calls (a previous failure won't cancel a new attempt)
    promise = promise.catch(_ => null).then(_ => func(dispatch, getState))

    lockToPromise.set(lock, promise)
    return promise
  }
}

module.exports = middlewareFactory
