import {
  set as updateStorage,
  get as getFromStorage,
  addChangeListener as addStorageChangeListener
} from './storage.js';

const PREFS_KEY = 'prefs';

export const PREF_SORT = 'sortType';
export const SORT_ALPHA = 'ALPHA';
export const SORT_NONE = null;

var _preferences = {};

function loadPreferences() {
  getFromStorage(PREFS_KEY).then((preferences) => {
    _preferences = preferences[PREFS_KEY];
  });
}

export function getPreference(key) {
  return preferences[key];
}

export function setPreference(change) {
  var _preferences = Object.assign({}, _preferences, change);
  var store = {};
  store[PREFS_KEY] = _preferences;
  return updateStorage(store);
}

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
