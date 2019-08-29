const chai = require('chai')
const assert = chai.assert

const middlewareFactory = require('../src/index')

suite('Middleware Test', function () {
  const doDispatch = () => {}
  const doGetState = () => {}
  const nextHandler = middlewareFactory()({
    dispatch: doDispatch,
    getState: doGetState
  })

  function timeout (time) {
    return new Promise(res => {
      setTimeout(() => {
        res()
      }, time)
    })
  }

  test('must run the given action function with dispatch and getState', (done) => {
    const actionHandler = nextHandler()

    actionHandler({
      lock: 'LOCK',
      function: async (dispatch, getState) => {
        assert.strictEqual(dispatch, doDispatch)
        assert.strictEqual(getState, doGetState)
        done()
      }
    })
  })

  test('must run the given action function with dispatch and getState and return associated value', async () => {
    const actionHandler = nextHandler()

    const val = await actionHandler({
      lock: 'LOCK',
      function: async _ => 'value'
    })

    assert.strictEqual(val, 'value')
  })

  test('must pass action to next if empty object', (done) => {
    const actionObj = {}

    const actionHandler = nextHandler((action) => {
      assert.strictEqual(action, actionObj)
      done()
    })

    actionHandler(actionObj)
  })

  test('must pass action to next if does not contain an async function', (done) => {
    const actionObj = { lock: 'LOCK', function: () => '' }

    const actionHandler = nextHandler((action) => {
      assert.strictEqual(action, actionObj)
      done()
    })

    actionHandler(actionObj)
  })

  test('must pass action to next if does not contain a lock', (done) => {
    const actionObj = { function: async _ => '' }

    const actionHandler = nextHandler((action) => {
      assert.strictEqual(action, actionObj)
      done()
    })

    actionHandler(actionObj)
  })

  test('must run the given action function with dispatch and getState', (done) => {
    const actionHandler = nextHandler()

    actionHandler({
      lock: 'LOCK',
      function: async (dispatch, getState) => {
        assert.strictEqual(dispatch, doDispatch)
        assert.strictEqual(getState, doGetState)
        done()
      }
    })
  })

  test('must run the given actions in order when they have the same lock', async () => {
    const actionHandler = nextHandler()

    const array = []

    actionHandler({
      lock: 'LOCK',
      function: async _ => {
        await timeout(0)
        array.push(1)
      }
    })

    const result = await actionHandler({
      lock: 'LOCK',
      function: async _ => {
        array.push(2)
        return 'value'
      }
    })
    assert.deepEqual(array, [1, 2])
    assert.strictEqual(result, 'value')
  })

  test('must run the given actions independently when they have different same lock', async () => {
    const actionHandler = nextHandler()

    const array = []

    const result = actionHandler({
      lock: 'LOCK1',
      function: async _ => {
        await timeout(0)
        array.push(1)
        return 'value'
      }
    })

    actionHandler({ lock: 'LOCK2', function: async _ => array.push(2) })
    assert.strictEqual(await result, 'value')
    assert.deepEqual(array, [2, 1])
  })
})
