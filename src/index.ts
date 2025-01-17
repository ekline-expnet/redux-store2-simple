'use strict'

import merge from 'merge'
import * as store2 from 'store2';
import { Middleware } from "redux";

const Store2 = (store2 as unknown) as store2.StoreType;

export interface RS2SOptions {
  states?: string[];
  ignoreStates?: string[];
  namespace?: string;
  session?: boolean;
  debounce?: number;
  disableWarnings?: boolean;
}
export interface LoadOptions {
  states?: string[];
  immutablejs?: boolean;
  namespace?: string;
  session?: boolean;
  preloadedState?: {};
  disableWarnings?: boolean;
}
export interface ClearOptions {
  namespace?: string;
  disableWarnings?: boolean;
  session?: boolean;
}

const MODULE_NAME = '[Redux-Store2-Simple]';
const NAMESPACE_DEFAULT = 'rs2s_';
// const NAMESPACE_SEPARATOR_DEFAULT = '_'
const STATES_DEFAULT: string[] = [];
const IGNORE_STATES_DEFAULT: string[] = [];
const DEBOUNCE_DEFAULT = 0;
const IMMUTABLEJS_DEFAULT = false;
const DISABLE_WARNINGS_DEFAULT = false;
let debounceTimeouts = new Map();

// ---------------------------------------------------
/* warn

  DESCRIPTION
  ----------
  Write a warning to the console if warnings are enabled

  PARAMETERS
  ----------
  @disableWarnings (Boolean) - If set to true then the warning is not written to the console
  @warningMessage (String) - The message to write to the console

*/

function warnConsole(warningMessage: string) {
  console.warn(MODULE_NAME, warningMessage);
}

function warnSilent(_warningMessage: string) {
  // Empty
}

const warn = (disableWarnings: boolean) => (disableWarnings ? warnSilent : warnConsole);

// ---------------------------------------------------
/* lensPath

  DESCRIPTION
  ----------
  Gets inner data from an object based on a specified path

  PARAMETERS
  ----------
  @path (Array of Strings) - Path used to get an object's inner data
                              e.g. ['prop', 'innerProp']
  @obj (Object) - Object to get inner data from

  USAGE EXAMPLE
  -------------
  lensPath(
    ['prop', 'innerProp'],
    { prop: { innerProp: 123 } }
  )

    returns

  123
*/

function lensPath(path: string[], obj: object): any {
  if (obj === undefined) {
    return null
  } else if (path.length === 1) {
    return obj[path[0]];
  } else {
    return lensPath(path.slice(1), obj[path[0]]);
  }
}

// ---------------------------------------------------
/* realiseObject

  DESCRIPTION
  ----------
  Create an object from a specified path, with
  the innermost property set with an initial value

  PARAMETERS
  ----------
  @objectPath (String) - Object path e.g. 'myObj.prop1.prop2'
  @objectInitialValue (Any, optional) - Value of the innermost property once object is created

  USAGE EXAMPLE
  -------------

  realiseObject('myObj.prop1.prop2', 123)

    returns

  {
    myObj: {
      prop1: {
          prop2: 123
        }
      }
  }
*/

function realiseObject(objectPath: string, objectInitialValue = {}) {
  function realiseObject_(objectPathArr: string[], objectInProgress: object): any {
    if (objectPathArr.length === 0) {
      return objectInProgress;
    } else {
      return realiseObject_(objectPathArr.slice(1), { [objectPathArr[0]]: objectInProgress });
    }
  }
  return realiseObject_(objectPath.split('.').reverse(), objectInitialValue)
}

function getStoreFromOptions(opts: RS2SOptions) {
  const { session = false, namespace } = opts || {};
  let store = Store2.local;
  if (session) {
    store = Store2.session;
  }
  if (namespace) {
    store = store.namespace(namespace);
  }
  return store;
}



// ---------------------------------------------------
// SafeLocalStorage wrapper to handle the minefield of exceptions
// that localStorage can throw. JSON.parse() is handled here as well.
class SafeLocalStorage {
  public store: store2.StoreBase;
  public warnFn: (m:string)=>void;
  constructor(warnFn: (m:string)=>void, storageOpts: RS2SOptions) {
    this.store = getStoreFromOptions(storageOpts);
    this.warnFn = warnFn || warnConsole;
  }
  public get length() {
    try {
      return this.store.length;
    } catch (err) {
      this.warnFn(err);
    }
    return 0;
  }
  public key(ind: number) {
    try {
      const keys = this.store.keys();
      return keys[ind];
    } catch (err) {
      this.warnFn(err);
    }
    return null
  }
  public setItem(key: string, val: any) {
    try {
      this.store.set(key, val);
    } catch (err) {
      this.warnFn(err);
    }
  }
  public getItem(key?: string) {
    try {
      if (typeof key !== 'string') {
        return this.store.getAll();
      }
      return this.store.get(key);
    } catch (err) {
      this.warnFn(err);
    }
    return null;
  }
  public removeItem(key: string) {
    try {
      this.store.remove(key);
    } catch (err) {
      this.warnFn(err);
    }
  }
  public clear() {
    try {
      this.store.clearAll();
    } catch (err) {
      this.warnFn(err);
    }
  }
}
// ---------------------------------------------------

/**
  Saves specified parts of the Redux state tree into localstorage
  Note: this is Redux middleware. Read this for an explanation:
  http://redux.js.org/docs/advanced/Middleware.html

  PARAMETERS
  ----------
  @config (Object) - Contains configuration options (leave blank to save entire state tree to localstorage)

            Properties:
              states (Array of Strings, optional) - States to save e.g. ['user', 'products']
              namespace (String, optional) - Namespace to add before your LocalStorage items
              debounce (Number, optional) - Debouncing period (in milliseconds) to wait before saving to LocalStorage
                                            Use this as a performance optimization if you feel you are saving
                                            to LocalStorage too often. Recommended value: 500 - 1000 milliseconds

  USAGE EXAMPLES
  -------------

    // save entire state tree - EASIEST OPTION
    save()

    // save specific parts of the state tree
    save({
      states: ['user', 'products']
    })

    // save the entire state tree under the namespace 'my_cool_app'. The key 'my_cool_app' will appear in LocalStorage
    save({
      namespace: 'my_cool_app'
    })

    // save the entire state tree only after a debouncing period of 500 milliseconds has elapsed
    save({
      debounce: 500
    })

    // save specific parts of the state tree with the namespace 'my_cool_app'. The keys 'my_cool_app_user' and 'my_cool_app_products' will appear in LocalStorage
    save({
        states: ['user', 'products'],
        namespace: 'my_cool_app',
        debounce: 500
    })
*/

export function save({
  states = STATES_DEFAULT,
  ignoreStates = IGNORE_STATES_DEFAULT,
  namespace = NAMESPACE_DEFAULT,
  session = false,
  debounce = DEBOUNCE_DEFAULT,
  disableWarnings = DISABLE_WARNINGS_DEFAULT
}: RS2SOptions = {}): Middleware {
  return store => next => action => {
    // Bake disableWarnings into the warn function
    const warn_ = warn(disableWarnings);
    const returnValue = next(action);
    let state_: object | undefined;

    // Validate 'states' parameter
    if (!isArray(states)) {
      console.error(MODULE_NAME, "'states' parameter in 'save()' method was passed a non-array value. Setting default value instead. Check your 'save()' method.");
      states = STATES_DEFAULT;
    }

    // Validate 'ignoreStates' parameter
    if (!isArray(ignoreStates)) {
      console.error(MODULE_NAME, "'ignoreStates' parameter in 'save()' method was passed a non-array value. Setting default value instead. Check your 'save()' method.");
      ignoreStates = IGNORE_STATES_DEFAULT;
    }

    // Validate individual entries in'ignoreStates' parameter
    if (ignoreStates.length > 0) {
      ignoreStates = ignoreStates.filter(function (ignoreState) {
        if (!isString(ignoreState)) {
          console.error(MODULE_NAME, "'ignoreStates' array contains a non-string value. Ignoring this value. Check your 'ignoreStates' array.")
        } else {
          return ignoreState
        }
      })
    }

    // Validate 'namespace' parameter
    if (!isString(namespace)) {
      console.error(MODULE_NAME, "'namespace' parameter in 'save()' method was passed a non-string value. Setting default value instead. Check your 'save()' method.");
      namespace = NAMESPACE_DEFAULT;
    }

    // // Validate 'namespaceSeparator' parameter
    // if (!isString(namespaceSeparator)) {
    //   console.error(MODULE_NAME, "'namespaceSeparator' parameter in 'save()' method was passed a non-string value. Setting default value instead. Check your 'save()' method.")
    //   namespaceSeparator = NAMESPACE_SEPARATOR_DEFAULT
    // }

    // Validate 'debounce' parameter
    if (!isInteger(debounce)) {
      console.error(MODULE_NAME, "'debounce' parameter in 'save()' method was passed a non-integer value. Setting default value instead. Check your 'save()' method.");
      debounce = DEBOUNCE_DEFAULT;
    }

    // Check if there are states to ignore
    if (ignoreStates.length > 0) {
      state_ = handleIgnoreStates(ignoreStates, store.getState());
    } else {
      state_ = store.getState();
    }
    const storage = new SafeLocalStorage(warn_, { session, namespace });

    // Check to see whether to debounce LocalStorage saving
    if (debounce) {
      // Clear the debounce timeout if it was previously set
      if (debounceTimeouts.get(states + namespace)) {
        clearTimeout(debounceTimeouts.get(states + namespace));
      }

      // Save to LocalStorage after the debounce period has elapsed
      debounceTimeouts.set(
        states + namespace,
        setTimeout(function () {
          _save();
        }, debounce)
      )
      // No debouncing necessary so save to LocalStorage right now
    } else {
      _save();
    }

    // Digs into rootState for the data to put in LocalStorage
    function getStateForLocalStorage(state:string, rootState:object) {
      const delimiter = '.'

      if (state.split(delimiter).length > 1) {
        return lensPath(state.split(delimiter), rootState)
      } else {
        return lensPath([state], rootState)
      }
    }

    // Local function to avoid duplication of code above
    function _save() {
      if (states.length === 0) {
        storage.store.setAll(state_)
      } else {
        states.forEach(state => {
          const key = state; // namespace + namespaceSeparator + state
          const stateForLocalStorage = getStateForLocalStorage(state, state_)
          if (stateForLocalStorage) {
            storage.setItem(key, stateForLocalStorage)
          } else {
            // Make sure nothing is ever saved for this incorrect state
            storage.removeItem(key)
          }
        })
      }
    }

    return returnValue
  }
}

/**
  Loads specified states from localstorage into the Redux state tree.

  PARAMETERS
  ----------
  @config (Object) - Contains configuration options (leave blank to load entire state tree, if it was saved previously that is)
            Properties:
              states (Array of Strings, optional) - Parts of state tree to load e.g. ['user', 'products']
              namespace (String, optional) - Namespace required to retrieve your LocalStorage items, if any

  Usage examples:

    // load entire state tree - EASIEST OPTION
    load()

    // load specific parts of the state tree
    load({
      states: ['user', 'products']
    })

    // load the entire state tree which was previously saved with the namespace "my_cool_app"
    load({
      namespace: 'my_cool_app'
    })

    // load specific parts of the state tree which was previously saved with the namespace "my_cool_app"
    load({
        states: ['user', 'products'],
        namespace: 'my_cool_app'
    })

*/

export function load({
  states = STATES_DEFAULT,
  immutablejs = IMMUTABLEJS_DEFAULT,
  namespace = NAMESPACE_DEFAULT,
  session = false,
  preloadedState = {},
  disableWarnings = DISABLE_WARNINGS_DEFAULT
}: LoadOptions = {}): object {
  // Bake disableWarnings into the warn function
  const warn_ = warn(disableWarnings);

  // Validate 'states' parameter
  if (!isArray(states)) {
    console.error(MODULE_NAME, "'states' parameter in 'load()' method was passed a non-array value. Setting default value instead. Check your 'load()' method.");
    states = STATES_DEFAULT;
  }

  // Validate 'namespace' parameter
  if (!isString(namespace)) {
    console.error(MODULE_NAME, "'namespace' parameter in 'load()' method was passed a non-string value. Setting default value instead. Check your 'load()' method.");
    namespace = NAMESPACE_DEFAULT;
  }

  // Display immmutablejs deprecation notice if developer tries to utilise it
  if (immutablejs === true) {
    warn_('Support for Immutable.js data structures has been deprecated as of version 2.0.0. Please use version 1.4.0 if you require this functionality.');
  }

  const storage = new SafeLocalStorage(warn_, { session, namespace });

  let loadedState = preloadedState;

  // Load all of the namespaced Redux data from LocalStorage into local Redux state tree
  if (states.length === 0) {
    const val = storage.getItem(); //getItem();
    if (val) {
      loadedState = val;
    }
  } else { // Load only specified states into the local Redux state tree
    states.forEach(function (key) {
      //namespace + namespaceSeparator + state
      const val = storage.getItem(key);
      if (val) {
        loadedState = merge.recursive(loadedState, realiseObject(key, val));
      } else {
        warn_("Invalid load '" + key + "' provided. Check your 'states' in 'load()'. If this is your first time running this app you may see this message. To disable it in future use the 'disableWarnings' flag, see documentation.");
      }
    })
  }
  return loadedState;
}

/**
  Combines multiple 'load' method calls to return a single state for use in Redux's createStore method.
  Use this when parts of the loading process need to be handled differently e.g. some parts of your state tree use different namespaces

  PARAMETERS
  ----------
  @loads - 'load' method calls passed into this method as normal arguments

  Usage example:

    // Load parts of the state tree saved with different namespaces
    combineLoads(
        load({ states: ['user'], namespace: 'account_stuff' }),
        load({ states: ['products', 'categories'], namespace: 'site_stuff' )
    )
*/

export function combineLoads(...loads: object[]): object {
  let combinedLoad = {};

  loads.forEach(load => {
    // Make sure current 'load' is an object
    if (!isObject(load)) {
      console.error(MODULE_NAME, "One or more loads provided to 'combineLoads()' is not a valid object. Ignoring the invalid load/s. Check your 'combineLoads()' method.");
      load = {};
    }

    for (let state in load) {
      combinedLoad[state] = load[state];
    }
  })

  return combinedLoad;
}

/**
  Clears all Redux state tree data from LocalStorage
  Remember to provide a namespace if you used one during the save process

  PARAMETERS
  ----------
  @config (Object) -Contains configuration options (leave blank to clear entire state tree from LocalStorage, if it was saved without a namespace)
            Properties:
              namespace (String, optional) - Namespace that you used during the save process

  Usage example:

    // clear all Redux state tree data saved without a namespace
    clear()

    // clear Redux state tree data saved with a namespace
    clear({
      namespace: 'my_cool_app'
    })
*/

export function clear({
  namespace = NAMESPACE_DEFAULT,
  disableWarnings = DISABLE_WARNINGS_DEFAULT,
  session = false
}: ClearOptions = {}): void {
  // Bake disableWarnings into the warn function
  const warn_ = warn(disableWarnings);

  // Validate 'namespace' parameter
  if (!isString(namespace)) {
    console.error(MODULE_NAME, "'namespace' parameter in 'clear()' method was passed a non-string value. Setting default value instead. Check your 'clear()' method.");
    namespace = NAMESPACE_DEFAULT
  }

  const storage = new SafeLocalStorage(warn_, { session, namespace });
  storage.clear();
  // const len = storage.length
  // for (let ind = 0; ind < len; ind++) {
  //   const key = storage.key(ind)

  //   // key starts with namespace
  //   if (key && key.slice(0, namespace.length) === namespace) {
  //     storage.removeItem(key)
  //   }
  // }
}

// ---------------------------------------------------
// Utility functions

function isArray(value: any) {
  return Object.prototype.toString.call(value) === '[object Array]';
}

function isString(value: any) {
  return typeof value === 'string';
}

function isInteger(value: any) {
  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value;
}

function isObject(value: any) {
  return value !== null && typeof value === 'object';
}

// Removes ignored states from the main state object
function handleIgnoreStates(ignoreStates: string[], stateFull: object) {
  let stateFullMinusIgnoreStates = Object.entries(stateFull).reduce(function (acc, [key, value]) {
    if (ignoreStates.indexOf(key) === -1) {
      acc[key] = stateFull[key];
    }
    return acc;
  }, {})
  return stateFullMinusIgnoreStates;
}
