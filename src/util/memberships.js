import { fetchTemplate } from './twitter.js';
import { preferences, PREF_SORT, SORT_ALPHA } from './preferences.js';

/** Fetch the list memberships for the given user in the current users' lists.
  * This is a raw HTML template that Twitter uses on the add to list modal.
  * @param {string} username - Target user
  * @return {Promise<Object>} - The good stuff is in the html property
  */
function fetchMemberships(username) {
  if (!username) return Promise.resolve();

  return fetchTemplate(`/i/${username}/lists`);
}

/** Extract the HTML from the JSON payload and grab the member list elements.
  * @param {Object} res - API response
  * @return {HTMLElement[]|undefined} - Memberships contained in the response
  */
function extractMemberships(res) {
  if (!res) {
    return;
  } else if (!res.html) {
    throw new Error(`Invalid response received in extractMemberships: ${JSON.stringify(res)}`);
  }

  const html = document.createElement('div');
  html.innerHTML = res.html;
  // [...qsa] requires a polyfill for chrome <45
  return Array.prototype.slice.call(html.querySelectorAll('.list-membership-container li'));
}

/** Process list of memberships. Sort by checked first, then name (if preferred).
  * @param {HTMLElement[]} elements - List of memberships
  * @return {HTMLElement[]} - Sorted list of memberships
*/
export function sortMemberships(elements) {
  if (!elements) return [];

  const isChecked = (el) => el.querySelector('.membership-checkbox').checked;
  const getName = (el) => el.innerText.trim().toLowerCase();

  // checked lists first
  const sorted = elements.sort((a, b) => {
    const aChecked = isChecked(a);
    const bChecked = isChecked(b);

    const aName = getName(a);
    const bName = getName(b);

    // sort by checked status first, then name (if preferred)
    if (aChecked === bChecked) {
      if (preferences[PREF_SORT] === SORT_ALPHA) {
        if (aName > bName) return 1;
        if (aName < bName) return -1;
      }
      return 0;
    }
    return aChecked ? -1 : 1;
  });

  return sorted;
}

function toHTML(elements) {
  return `<ul class="list-membership-container">
    ${elements.map((e) => e.outerHTML).join('\n')}
  </ul>`;
}

/** Get a given user's list memberships
  * @param {string} username - Target user
  * @return {Promise<string>} Memberships modal HTML
  */
export function getMemberships(username) {
  return fetchMemberships(username)
    .then(extractMemberships)
    .then(sortMemberships)
    .then(toHTML);
}
