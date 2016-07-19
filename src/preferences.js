import { preferences, setPreference, PREF_SORT, SORT_ALPHA, SORT_NONE } from './util/preferences.js';

export function createPrefsDropdown() {
  var sortPreference = preferences[PREF_SORT];
  var sortAlphaLi = sortPreference === SORT_ALPHA ? '' :
    `<li role="presentation">
      <button type="button" class="js-sort-alpha dropdown-link" role="menuitem">Sort alphabetically</button>
    </li>`;

  var resetSortLi = (sortPreference === SORT_NONE || sortPreference === undefined) ? '' :
    `<li role="presentation">
      <button type="button" class="js-sort-reset dropdown-link" role="menuitem">Reset sorting</button>
    </li>`;

  return `<div class="list-prefs dropdown">
            <button class="Prefs-ActionButton u-textUserColorHover dropdown-toggle js-dropdown-toggle" type="button" aria-haspopup="true" id="menu-0">
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
                ${sortAlphaLi}
                ${resetSortLi}
            </ul>
            <div class="js-last-tabstop" tabindex="0"></div>
          </div>`;
}

function setSort(type) {
  var pref = {};
  pref[PREF_SORT] = type;
  setPreference(pref);
}

function handleDropdown(evt) {
  var {target} = evt;

  if (target.classList.contains('js-sort-alpha')) {
    setSort(SORT_ALPHA);
  } else if (target.classList.contains('js-sort-reset')) {
    setSort(SORT_NONE);
  }

  this.classList.toggle('open');
}

export function setupPrefsDropdown() {
  document.querySelector('.list-prefs')
    .addEventListener('click', handleDropdown);
}
