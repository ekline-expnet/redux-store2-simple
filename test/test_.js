'use strict'

import { legacy_createStore, applyMiddleware, combineReducers } from 'redux'
import { save as saveMiddleware, load, clear } from '../src/index' // redux-store2-simple dist
import equal from 'deep-equal'

const NAMESPACE_DEFAULT = 'rls_'
const NAMESPACE_TEST = 'namespace_test'
const NAMESPACE_SEPARATOR_TEST = '**'
const USE_SESSION = true;
const storeToCheck = USE_SESSION ? sessionStorage : localStorage;

const save = (opts) => {
  const saveOpts = opts || {};
  saveOpts.session = USE_SESSION;
  return saveMiddleware(saveOpts);
}
// -------------------------------------------------------------------------------

// Actions
var APPEND = 'APPEND'
var ADD = 'ADD'
var MODIFY = 'MODIFY'
var NOOP = 'NOOP'

// -------------------------------------------------------------------------------

var initialStateReducerA = {
  x: 'abc'
}

var initialStateReducerB = {
  y: 0
}

var initialStateReducerMultipleLevels = {
  setting1: false,
  setting2: false,
  setting3: {
    level1: {
      level2: 'hello'
    }
  }
}

var initialStateReducers = {
  reducerA: initialStateReducerA,
  reducerB: initialStateReducerB
}

var initialStateReducersPlusMultipleLevels = {
  reducerMultipleLevels: initialStateReducerMultipleLevels
}

// -------------------------------------------------------------------------------

var reducerA = function (state = initialStateReducerA, action) {
  switch (action.type) {
    case APPEND:
      return {
        x: state.x + 'x'
      }
    case NOOP:
      return state
    default:
      return state
  }
}

var reducerB = function (state = initialStateReducerB, action) {
  switch (action.type) {
    case ADD:
      return {
        y: state.y + 1
      }
    default:
      return state
  }
}

var reducerMultipleLevels = function (state = initialStateReducerMultipleLevels, action) {
  switch (action.type) {
    case MODIFY:
      return {
        setting1: true, // modified
        setting2: false,
        setting3: {
          level1: {
            level2: 'helloEdited' // modified
          }
        }
      }
    case NOOP:
      return state
    default:
      return state
  }
}

// -------------------------------------------------------------------------------
// TEST 0 - LocalStorage, are you there?
// -------------------------------------------------------------------------------

{
  if (typeof storeToCheck === 'object') {
    outputTestResult('test0', true)
  } else {
    outputTestResult('test0', false)
  }
}

// -------------------------------------------------------------------------------
// TEST 1 - Save and load entire Redux state tree
// -------------------------------------------------------------------------------
clearTestData()

{
  let middleware = save()

  // Store which saves to LocalStorage
  let storeA = applyMiddleware(middleware)(legacy_createStore)(
    combineReducers({ reducerA, reducerB }),
    initialStateReducers
  )

  // Trigger a save to LocalStorage using a noop action
  storeA.dispatch({ type: NOOP })

  // Store which loads from LocalStorage
  let storeB = legacy_createStore(
    combineReducers({ reducerA, reducerB }),
    load({ session: USE_SESSION })
  )

  let testResult = equal(
    storeA.getState(),
    storeB.getState()
  )

  outputTestResult('test1', testResult)
}

// -------------------------------------------------------------------------------
// TEST 2 - Save and load part of the Redux state tree
// -------------------------------------------------------------------------------
clearTestData()

{
  let middleware = save({ states: ['reducerA'] })
  // Store which saves to LocalStorage
  let storeA = applyMiddleware(middleware)(legacy_createStore)(
    combineReducers({ reducerA, reducerB }),
    initialStateReducers
  )

  // Trigger a save to LocalStorage using an append action
  storeA.dispatch({ type: APPEND })

  // Store which loads from LocalStorage
  let storeB = legacy_createStore(
    combineReducers({ reducerA, reducerB }),
    load({ states: ['reducerA'], session: USE_SESSION })
  )
  let testResult = equal(
    storeA.getState(),
    storeB.getState()
  )

  outputTestResult('test2', testResult)
}
// -------------------------------------------------------------------------------
// TEST 3 - Save and load entire Redux state tree under a specified namespace
// -------------------------------------------------------------------------------
clearTestData()

{
  let middleware = save({ namespace: NAMESPACE_TEST })

  // Store which saves to LocalStorage
  let storeA = applyMiddleware(middleware)(legacy_createStore)(
    combineReducers({ reducerA, reducerB }),
    initialStateReducers
  )

  // Trigger a save to LocalStorage using a noop action
  storeA.dispatch({ type: NOOP })

  // Store which loads from LocalStorage
  let storeB = legacy_createStore(
    combineReducers({ reducerA, reducerB }),
    load({ namespace: NAMESPACE_TEST, session: USE_SESSION })
  )

  let testResult = equal(
    storeA.getState(),
    storeB.getState()
  )

  outputTestResult('test3', testResult)
}

// -------------------------------------------------------------------------------
// TEST 4 - Save and load part of the Redux state tree under a specified namespace
// -------------------------------------------------------------------------------
clearTestData()

{
  let middleware = save({ states: ['reducerA'], namespace: NAMESPACE_TEST })

  // Store which saves to LocalStorage
  let storeA = applyMiddleware(middleware)(legacy_createStore)(
    combineReducers({ reducerA, reducerB }),
    initialStateReducers
  )

  // Trigger a save to LocalStorage using an append action
  storeA.dispatch({ type: APPEND })

  // Store which loads from LocalStorage
  let storeB = legacy_createStore(
    combineReducers({ reducerA, reducerB }),
    load({ states: ['reducerA'], session: USE_SESSION, namespace: NAMESPACE_TEST })
  )

  let testResult = equal(
    storeA.getState(),
    storeB.getState()
  )

  outputTestResult('test4', testResult)
}

// -------------------------------------------------------------------------------------------------
// TEST 5 - Save and load entire Redux state tree under a specified namespace and namespaceSeparator
// -------------------------------------------------------------------------------------------------
clearTestData()

{
  let middleware = save({ namespace: NAMESPACE_TEST, namespaceSeparator: NAMESPACE_SEPARATOR_TEST })

  // Store which saves to LocalStorage
  let storeA = applyMiddleware(middleware)(legacy_createStore)(
    combineReducers({ reducerA, reducerB }),
    initialStateReducers
  )

  // Trigger a save to LocalStorage using a noop action
  storeA.dispatch({ type: NOOP })

  // Store which loads from LocalStorage
  let storeB = legacy_createStore(
    combineReducers({ reducerA, reducerB }),
    load({ namespace: NAMESPACE_TEST, session: USE_SESSION })
  )

  let testResult = equal(
    storeA.getState(),
    storeB.getState()
  )

  outputTestResult('test5', testResult)
}

// ------------------------------------------------------------------------------------------------------
// TEST 6 - Save and load part of the Redux state tree under a specified namespace and namespaceSeparator
// ------------------------------------------------------------------------------------------------------
clearTestData()

{
  let middleware = save({ states: ['reducerA'], namespace: NAMESPACE_TEST, namespaceSeparator: NAMESPACE_SEPARATOR_TEST })

  // Store which saves to LocalStorage
  let storeA = applyMiddleware(middleware)(legacy_createStore)(
    combineReducers({ reducerA, reducerB }),
    initialStateReducers
  )

  // Trigger a save to LocalStorage using an append action
  storeA.dispatch({ type: APPEND })

  // Store which loads from LocalStorage
  let storeB = legacy_createStore(
    combineReducers({ reducerA, reducerB }),
    load({ states: ['reducerA'], namespace: NAMESPACE_TEST, session: USE_SESSION })
  )

  let testResult = equal(
    storeA.getState(),
    storeB.getState()
  )

  outputTestResult('test6', testResult)
}

// -------------------------------------------------------------------------------
// TEST 7 - Clear Redux state tree data saved without a specific namespace
// -------------------------------------------------------------------------------
clearTestData()

{
  // Store that saves without a namespace
  let storeA = applyMiddleware(save({ session: USE_SESSION }))(legacy_createStore)(reducerA, initialStateReducerA)
  // Trigger a save to LocalStorage using a noop action
  storeA.dispatch({ type: NOOP })

  // Store that saves WITH a namespace
  let storeB = applyMiddleware(save({ session: USE_SESSION, namespace: NAMESPACE_TEST }))(legacy_createStore)(reducerA, initialStateReducerA)
  // Trigger a save to LocalStorage using a noop action
  storeB.dispatch({ type: NOOP })

  // Perform the LocalStorage clearing
  clear({ session: USE_SESSION })

  outputTestResult('test7', true) // Default test result to true
  for (let key in storeToCheck) {
    // If data found with default namespace then clearing data has failed
    if (key.slice(0, NAMESPACE_DEFAULT.length) === NAMESPACE_DEFAULT) {
      // Fail the test
      outputTestResult('test7', false)
    }
  }
}

// -------------------------------------------------------------------------------
// TEST 8 - Clear Redux state tree data saved with a specific namespace
// -------------------------------------------------------------------------------
clearTestData()
{
  // Store that saves without a namespace
  let storeA = applyMiddleware(save({ namespace: NAMESPACE_TEST }))(legacy_createStore)(reducerA, initialStateReducerA)
  // Trigger a save to LocalStorage using a noop action
  storeA.dispatch({ type: NOOP })

  // Store that saves WITH a namespace
  let storeB = applyMiddleware(save({ namespace: NAMESPACE_TEST }))(legacy_createStore)(reducerA, initialStateReducerA)
  // Trigger a save to LocalStorage using a noop action
  storeB.dispatch({ type: NOOP })

  // Perform the LocalStorage clearing
  clear({ namespace: NAMESPACE_TEST, session: USE_SESSION })

  outputTestResult('test8', true); // Default test result to true
  for (let key in storeToCheck) {
    // If data found with specified namespace then clearing data has failed
    if (key.slice(0, NAMESPACE_TEST.length) === NAMESPACE_TEST) {
      // Fail the test
      outputTestResult('test8', false)
    }
  }
}
// -------------------------------------------------------------------------------
// TEST 9 - Save Redux state with debouncing
// -------------------------------------------------------------------------------

clearTestData()

{
  let debouncingPeriod = 500

  // Store that saves with a debouncing period
  let storeA = applyMiddleware(save({ debounce: debouncingPeriod }))(legacy_createStore)(reducerB, initialStateReducerB)
  // Trigger a save to LocalStorage using an add action
  storeA.dispatch({ type: ADD })

  // Store which loads from LocalStorage
  let storeB = legacy_createStore(reducerB, load({ session: USE_SESSION }))
  // This test result should fail because the debouncing period has
  // delayed the data being written to LocalStorage
  let testResult = storeB.getState()['y'] === 1
  outputTestResult('test9', testResult)

  // This timeout will recheck LocalStorage after a period longer than
  // our specified debouncing period. Therefore it will see the updated
  // LocalStorage dataand the test should pass
  setTimeout(function () {
    // Store which loads from LocalStorage
    let storeC = legacy_createStore(reducerB, load({ session: USE_SESSION }))
    let testResult = storeC.getState()['y'] === 1
    outputTestResult('test9', testResult)

    // Perform the LocalStorage clearing
    clear({ session: USE_SESSION })
  }, debouncingPeriod + 200)
}

// -------------------------------------------------------------------------------
// TEST 10 - Save and load specific properties of a <u>part</u> of Redux state tree under a specified <u>namespace</u>
// -------------------------------------------------------------------------------
clearTestData()

{

  let states = [
    'reducerMultipleLevels.setting1',
    'reducerMultipleLevels.setting3.level1.level2'
  ]

  let middleware = save({ states: states, namespace: NAMESPACE_TEST })

  // Store which saves to LocalStorage
  let storeA = applyMiddleware(middleware)(legacy_createStore)(
    combineReducers({ reducerMultipleLevels }),
    initialStateReducersPlusMultipleLevels
  )

  storeA.dispatch({ type: MODIFY })

  // Store which loads from LocalStorage
  let storeB = legacy_createStore(
    combineReducers({ reducerMultipleLevels }),
    load({
      states: states,
      namespace: NAMESPACE_TEST,
      session: USE_SESSION,
      preloadedState: initialStateReducersPlusMultipleLevels
    })
  )

  let testResult = equal(
    storeA.getState(),
    storeB.getState()
  )
  // Perform the LocalStorage clearing
  clear({
    namespace: NAMESPACE_TEST,
    session: USE_SESSION,
  });
  outputTestResult('test10', testResult)
}

// -------------------------------------------------------------------------------
// TEST 11 - Save and load entire Redux state tree except the states we ignore
// -------------------------------------------------------------------------------

clearTestData()

{

  let initialState = {
    z1: 0,
    z2: 'z',
    z3: 1
  }

  let successState = {
    z2: 'z'
  }

  let reducer = function (state = initialState, action) {
    switch (action.type) {
      case NOOP:
        return state
      default:
        return state
    }
  }

  let middleware = save({ session: USE_SESSION, ignoreStates: ['z1', 'z3'] })

  // Store which saves to LocalStorage
  let storeA = applyMiddleware(middleware)(legacy_createStore)(reducer)

  // Trigger a save to LocalStorage using a noop action
  storeA.dispatch({ type: NOOP })
  // Store which loads from LocalStorage
  let storeB = legacy_createStore(
    reducer,
    load({ session: USE_SESSION })
  );

  let testResult = equal(
    successState,
    storeB.getState()
  )

  outputTestResult('test11', testResult)
}

// -------------------------------------------------------------------------------

// Output result of test in browser
function outputTestResult(test, testResult) {
  document.getElementById(test).innerHTML = (testResult) ? 'SUCCESS' : 'FAILED'
  document.getElementById(test).className = (testResult) ? 'true' : 'false'
}

// Clear test data in LocalStorage
function clearTestData() {
  for (let key in storeToCheck) {
    if (key.slice(0, NAMESPACE_DEFAULT.length) === NAMESPACE_DEFAULT ||
      key.slice(0, NAMESPACE_TEST.length) === NAMESPACE_TEST) {
        storeToCheck.removeItem(key)
    }
  }
}
