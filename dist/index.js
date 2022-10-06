"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.clear=clear,exports.combineLoads=combineLoads,exports.load=load,exports.save=save;var _merge=_interopRequireDefault(require("merge")),Store2=_interopRequireWildcard(require("store2"));function _getRequireWildcardCache(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(_getRequireWildcardCache=function(a){return a?c:b})(a)}function _interopRequireWildcard(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!==_typeof(a)&&"function"!=typeof a)return{default:a};var c=_getRequireWildcardCache(b);if(c&&c.has(a))return c.get(a);var d={},e=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var f in a)if("default"!=f&&Object.prototype.hasOwnProperty.call(a,f)){var g=e?Object.getOwnPropertyDescriptor(a,f):null;g&&(g.get||g.set)?Object.defineProperty(d,f,g):d[f]=a[f]}return d["default"]=a,c&&c.set(a,d),d}function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function _slicedToArray(a,b){return _arrayWithHoles(a)||_iterableToArrayLimit(a,b)||_unsupportedIterableToArray(a,b)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(a,b){if(a){if("string"==typeof a)return _arrayLikeToArray(a,b);var c=Object.prototype.toString.call(a).slice(8,-1);return"Object"===c&&a.constructor&&(c=a.constructor.name),"Map"===c||"Set"===c?Array.from(a):"Arguments"===c||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(c)?_arrayLikeToArray(a,b):void 0}}function _arrayLikeToArray(a,b){(null==b||b>a.length)&&(b=a.length);for(var c=0,d=Array(b);c<b;c++)d[c]=a[c];return d}function _iterableToArrayLimit(a,b){var c=null==a?null:"undefined"!=typeof Symbol&&a[Symbol.iterator]||a["@@iterator"];if(null!=c){var d,e,f=[],g=!0,h=!1;try{for(c=c.call(a);!(g=(d=c.next()).done)&&(f.push(d.value),!(b&&f.length===b));g=!0);}catch(a){h=!0,e=a}finally{try{g||null==c["return"]||c["return"]()}finally{if(h)throw e}}return f}}function _arrayWithHoles(a){if(Array.isArray(a))return a}function _typeof(a){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},_typeof(a)}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}var MODULE_NAME="[Redux-Store2-Simple]",NAMESPACE_DEFAULT="rls_",STATES_DEFAULT=[],IGNORE_STATES_DEFAULT=[],DEBOUNCE_DEFAULT=0,IMMUTABLEJS_DEFAULT=!1,DISABLE_WARNINGS_DEFAULT=!1,debounceTimeouts=new Map;function warnConsole(a){console.warn(MODULE_NAME,a)}function warnSilent(){}var warn=function(a){return a?warnSilent:warnConsole};function lensPath(a,b){return void 0===b?null:1===a.length?b[a[0]]:lensPath(a.slice(1),b[a[0]])}function realiseObject(a){function b(a,c){return 0===a.length?c:b(a.slice(1),_defineProperty({},a[0],c))}var c=1<arguments.length&&arguments[1]!==void 0?arguments[1]:{};return b(a.split(".").reverse(),c)}function getStoreFromOptions(a){var b=a||{},c=b.session,d=b.namespace,e=Store2.local;return void 0!==c&&c&&(e=Store2.session),d&&(e=e.namespace(d)),e}function SafeLocalStorage(a,b){this.store=getStoreFromOptions(b),this.warnFn=a||warnConsole}Object.defineProperty(SafeLocalStorage.prototype,"length",{get:function(){try{return this.store.length}catch(a){this.warnFn(a)}return 0},configurable:!0,enumerable:!0}),SafeLocalStorage.prototype.key=function(a){try{var b=this.store.keys();return b[a]}catch(a){this.warnFn(a)}return null},SafeLocalStorage.prototype.setItem=function(a,b){try{this.store.set(a,b)}catch(a){this.warnFn(a)}},SafeLocalStorage.prototype.getItem=function(a){try{return"string"==typeof a?this.store.get(a):this.store.getAll()}catch(a){this.warnFn(a)}return null},SafeLocalStorage.prototype.removeItem=function(a){try{this.store.remove(a)}catch(a){this.warnFn(a)}},SafeLocalStorage.prototype.clear=function(){try{this.store.clearAll()}catch(a){this.warnFn(a)}};function save(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},b=a.states,c=void 0===b?STATES_DEFAULT:b,d=a.ignoreStates,e=void 0===d?IGNORE_STATES_DEFAULT:d,f=a.namespace,g=void 0===f?NAMESPACE_DEFAULT:f,h=a.session,i=a.debounce,j=void 0===i?DEBOUNCE_DEFAULT:i,k=a.disableWarnings,l=void 0===k?DISABLE_WARNINGS_DEFAULT:k;return function(a){return function(b){return function(d){function f(a,b){return 1<a.split(".").length?lensPath(a.split("."),b):lensPath([a],b)}function i(){0===c.length?o.store.setAll(k):c.forEach(function(a){var b=a,c=f(a,k);c?o.setItem(b,c):o.removeItem(b)})}var k,m=warn(l),n=b(d);isArray(c)||(console.error(MODULE_NAME,"'states' parameter in 'save()' method was passed a non-array value. Setting default value instead. Check your 'save()' method."),c=STATES_DEFAULT),isArray(e)||(console.error(MODULE_NAME,"'ignoreStates' parameter in 'save()' method was passed a non-array value. Setting default value instead. Check your 'save()' method."),e=IGNORE_STATES_DEFAULT),0<e.length&&(e=e.filter(function(a){return isString(a)?a:void console.error(MODULE_NAME,"'ignoreStates' array contains a non-string value. Ignoring this value. Check your 'ignoreStates' array.")})),isString(g)||(console.error(MODULE_NAME,"'namespace' parameter in 'save()' method was passed a non-string value. Setting default value instead. Check your 'save()' method."),g=NAMESPACE_DEFAULT),isInteger(j)||(console.error(MODULE_NAME,"'debounce' parameter in 'save()' method was passed a non-integer value. Setting default value instead. Check your 'save()' method."),j=DEBOUNCE_DEFAULT),k=0<e.length?handleIgnoreStates(e,a.getState()):a.getState();var o=new SafeLocalStorage(m,{session:void 0!==h&&h,namespace:g});return j?(debounceTimeouts.get(c+g)&&clearTimeout(debounceTimeouts.get(c+g)),debounceTimeouts.set(c+g,setTimeout(function(){i(c,g)},j))):i(c,g),n}}}}function load(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},b=a.states,c=void 0===b?STATES_DEFAULT:b,d=a.immutablejs,e=void 0===d?IMMUTABLEJS_DEFAULT:d,f=a.namespace,g=void 0===f?NAMESPACE_DEFAULT:f,h=a.session,i=a.preloadedState,j=void 0===i?{}:i,k=a.disableWarnings,l=void 0===k?DISABLE_WARNINGS_DEFAULT:k,m=warn(l);isArray(c)||(console.error(MODULE_NAME,"'states' parameter in 'load()' method was passed a non-array value. Setting default value instead. Check your 'load()' method."),c=STATES_DEFAULT),isString(g)||(console.error(MODULE_NAME,"'namespace' parameter in 'load()' method was passed a non-string value. Setting default value instead. Check your 'load()' method."),g=NAMESPACE_DEFAULT),!0===e&&m("Support for Immutable.js data structures has been deprecated as of version 2.0.0. Please use version 1.4.0 if you require this functionality.");var n=new SafeLocalStorage(m,{session:void 0!==h&&h,namespace:g}),o=j;if(0===c.length){var p=n.getItem();p&&(o=p)}else c.forEach(function(a){var b=n.getItem(a);b?o=_merge["default"].recursive(o,realiseObject(a,b)):m("Invalid load '"+a+"' provided. Check your 'states' in 'load()'. If this is your first time running this app you may see this message. To disable it in future use the 'disableWarnings' flag, see documentation.")});return o}function combineLoads(){for(var a={},b=arguments.length,c=Array(b),d=0;d<b;d++)c[d]=arguments[d];return c.forEach(function(b){for(var c in isObject(b)||(console.error(MODULE_NAME,"One or more loads provided to 'combineLoads()' is not a valid object. Ignoring the invalid load/s. Check your 'combineLoads()' method."),b={}),b)a[c]=b[c]}),a}function clear(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},b=a.namespace,c=void 0===b?NAMESPACE_DEFAULT:b,d=a.disableWarnings,e=void 0===d?DISABLE_WARNINGS_DEFAULT:d,f=a.session,g=warn(e);isString(c)||(console.error(MODULE_NAME,"'namespace' parameter in 'clear()' method was passed a non-string value. Setting default value instead. Check your 'clear()' method."),c=NAMESPACE_DEFAULT);var h=new SafeLocalStorage(g,{session:void 0!==f&&f,namespace:c});h.clear()}function isArray(a){return"[object Array]"===Object.prototype.toString.call(a)}function isString(a){return"string"==typeof a}function isInteger(a){return"number"==typeof a&&isFinite(a)&&Math.floor(a)===a}function isObject(a){return null!==a&&"object"===_typeof(a)}function handleIgnoreStates(a,b){var c=Object.entries(b).reduce(function(c,d){var e=_slicedToArray(d,2),f=e[0],g=e[1];return-1===a.indexOf(f)&&(c[f]=b[f]),c},{});return c}