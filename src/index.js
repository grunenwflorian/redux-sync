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

    const lock = action.lock,
          func = action.function;

    let promise = lockToPromise.has(lock) ? lockToPromise.get(lock) : Promise.resolve();
    promise = promise.then(_ => func(dispatch, getState));
    
    lockToPromise.set(lock, promise);
    return promise;
  }
}

module.exports = middlewareFactory
