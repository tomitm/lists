import { preferences, setPreference, PREF_SORT, SORT_ALPHA, SORT_NONE } from './util/preferences.js';

/** Create preferences dropdown HTML.
  * @return {string} html
  */
export function createPrefsDropdown() {
  var sort = preferences[PREF_SORT];
  var sortAlphaLi = sort === SORT_ALPHA ? '' :
    `<li role="presentation">
      <button type="button" class="js-sort-alpha dropdown-link" role="menuitem">Sort alphabetically</button>
    </li>`;

  var resetSortLi = (sort === SORT_NONE || !sort) ? '' :
    `<li role="presentation">
      <button type="button" class="js-sort-reset dropdown-link" role="menuitem">Reset sorting</button>
    </li>`;

  return `<div class="list-prefs dropdown">
            <button class="Prefs-ActionButton u-textUserColorHover dropdown-toggle js-dropdown-toggle" type="button" tabindex="-1" aria-haspopup="true" id="menu-0">
                <div class="IconContainer js-tooltip" data-original-title="Preferences">
                  <span class="Icon Icon--filter"></span>
                  <span class="u-hiddenVisually">Preferences</span>
                </div>
            </button>

            <div class="dropdown-menu">
              <div class="js-first-tabstop" tabindex="0"></div>
              <div class="dropdown-caret">
                <div class="caret-outer"></div>
                <div class="caret-inner"></div>
              </div>
              <ul tabindex="-1" role="menu" aria-labelledby="menu-0" aria-hidden="false">
                  ${sortAlphaLi}
                  ${resetSortLi}
              </ul>
              <div class="js-last-tabstop" tabindex="0"></div>
            </div>
          </div>`;
}

/** Update the sort preference.
  * @param {string} type - New sort type
  */
function setSort(type) {
  var pref = {};
  pref[PREF_SORT] = type;
  setPreference(pref);
}

/** Handle focus change on dropdown to close the menu.
  * @param {FocusEvent} evt - focus event via event listener
  */
function handleFocus(evt) {
  var target = evt.relatedTarget;

  if (!target) { // not related? shut 'er down.
    this.classList.remove('open');
    return;
  }

  // focused on a tabstop? let's help a little
  if (target.classList.contains('js-first-tabstop') ||
      target.classList.contains('js-last-tabstop')) {
    this.querySelector('.dropdown-link').focus();
    return;
  }

  // avoid prematurely closing on a dropdown link
  if (target.classList.contains('dropdown-link')) return;

  this.classList.remove('open');
}

/** Handle clicks on dropdown menu items and toggles the menu state.
  * @param {MouseEvent} evt - click event via event listener
  */
function handleClick(evt) {
  var {target} = evt;

  if (target.classList.contains('js-sort-alpha')) {
    setSort(SORT_ALPHA);
  } else if (target.classList.contains('js-sort-reset')) {
    setSort(SORT_NONE);
  }

  this.classList.toggle('open');
}

/** Setup listeners necessary for prefs dropdown.
  */
export function setupPrefsDropdown() {
  var prefsElement = document.querySelector('.list-prefs');
  prefsElement.addEventListener('click', handleClick);
  prefsElement.addEventListener('focusout', handleFocus);
}
