import {
  set as updateStorage,
  get as getFromStorage,
  addChangeListener as addStorageChangeListener
} from './storage.js';

const PREFS_KEY = 'prefs';

export const PREF_SORT = 'sortType';
export const SORT_ALPHA = 'ALPHA';
export const SORT_NONE = 'NONE';

var _preferences = {};

function loadPreferences() {
  getFromStorage(PREFS_KEY).then((preferences) => {
    _preferences = preferences[PREFS_KEY];
  });
}

/** Get preference by key.
  * @param {string} key
  */
export function getPreference(key) {
  return preferences[key];
}

/** Set preference with a given value.
  * @param {object} change - includes key to change and value to update to
  */
export function setPreference(change) {
  var _preferences = Object.assign({}, _preferences, change);
  var store = {}; // sadly {[PREFS_KEY]: _prefs} requires a babel helper
  store[PREFS_KEY] = _preferences;
  return updateStorage(store);
}

/** Register a change listener for when preferences update.
  * @param {function} listener
  */
export function addChangeListener(listener) {
  addStorageChangeListener(PREFS_KEY, listener);
}

export default function setupPreferences(pageChange) {
  if (pageChange) return;

  loadPreferences();

  addChangeListener((preferences) => {
    _preferences = Object.assign({}, _preferences, preferences);
  });
}

export {_preferences as preferences};
