import {
  set as updateStorage,
  get as getFromStorage,
  addChangeListener
} from './util/storage.js';

const PREFS_KEY = 'prefs';
var _preferences = {};

function loadPreferences() {
  getFromStorage(PREFS_KEY).then((preferences) => {
    _preferences = preferences[PREFS_KEY];
    console.log("loaded preferences", _preferences);
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

export function createPrefsDropdown() {
  return `<div class="list-prefs dropdown">
            <button class="ProfileTweet-actionButton u-textUserColorHover dropdown-toggle js-dropdown-toggle" type="button" aria-haspopup="true" id="menu-0">
                <div class="IconContainer js-tooltip" data-original-title="Preferences">
                  <span class="Icon Icon--filter"></span>
                  <span class="u-hiddenVisually">Preferences</span>
                </div>
            </button>

            <div class="dropdown-menu"><div class="js-first-tabstop" tabindex="0"></div>

            <div class="dropdown-caret">
              <div class="caret-outer"></div>
              <div class="caret-inner"></div>
            </div>

            <ul tabindex="-1" role="menu" aria-labelledby="menu-0" aria-hidden="false">
                <li class="" role="presentation">
                  <button type="button" class="js-sort-alpha dropdown-link" role="menuitem">Sort alphabetically</button>
                </li>

                <li class="" role="presentation">
                  <button type="button" class="js-sort-reset dropdown-link" role="menuitem">Reset sorting</button>
                </li>
            </ul>
            <div class="js-last-tabstop" tabindex="0"></div>
          </div>`;
}

function setSortAlpha() {
  console.log('sort alpha');
  setPreference({sort: 'ALPHA'});
}

function resetSort() {
  console.log('sort reset');
  setPreference({sort: null});
}

function handleDropdown(evt) {
  var {target} = evt;
  console.log(this, target);

  if (target.classList.contains('js-sort-alpha')) {
    setSortAlpha();
  } else if (target.classList.contains('js-sort-reset')) {
    resetSort();
  }

  this.classList.toggle('open');
}

export function setupPrefsDropdown() {
  document.querySelector('.list-prefs').addEventListener('click', handleDropdown);
}

export default function setupPreferences(pageChange) {
  if (pageChange) return;

  loadPreferences();

  addChangeListener(PREFS_KEY, (preferences) => {
    _preferences = Object.assign({}, _preferences, preferences);
    console.log("storage.onChanged", _preferences);
  });
}
