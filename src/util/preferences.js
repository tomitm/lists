import {
  set as updateStorage,
  get as getFromStorage,
  addChangeListener as addStorageChangeListener
} from './storage.js';

const PREFS_KEY = 'prefs';

export const PREF_SORT = 'sortType';
export const SORT_ALPHA = 'ALPHA';
export const SORT_NONE = 'NONE';

export let preferences = {}; // eslint-disable-line import/no-mutable-exports

function loadPreferences() {
  getFromStorage(PREFS_KEY).then((storage) => {
    preferences = storage[PREFS_KEY];
  });
}

/** Get preference by key.
  * @param {string} key - Preference key
  * @returns {*} - preference
  */
export function getPreference(key) {
  return preferences[key];
}

/** Set preference with a given value.
  * @param {Object} change - includes key to change and value to update to
  * @returns {Promise} - Resolves when successfully stored, rejects when error
  */
export function setPreference(change) {
  const newPreferences = Object.assign({}, preferences, change);
  const store = {}; // sadly {[PREFS_KEY]: _prefs} requires a babel helper
  store[PREFS_KEY] = newPreferences;
  return updateStorage(store);
}

/** Register a change listener for when preferences update.
  * @param {Function} listener - Listener to be called when preferences update
  */
export function addChangeListener(listener) {
  addStorageChangeListener(PREFS_KEY, listener);
}

export default function setupPreferences(pageChange) {
  if (pageChange) return;

  loadPreferences();

  addChangeListener((updates) => {
    preferences = Object.assign({}, preferences, updates);
  });
}
