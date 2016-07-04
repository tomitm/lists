import { fetchTemplate } from './twitter.js';

/** Fetch the list memberships for the given user in the current users' lists.
  * This is a raw HTML template that Twitter uses on the add to list modal.
  * @param {string} username
  * @return {Promise<object>} - The good stuff is in the html property
  */
function fetchMemberships(username) {
  if (!username) return Promise.resolve();

  return fetchTemplate(`/i/${username}/lists`);
}

/** Extract the HTML from the JSON payload and grab the member list elements.
  * @param {Object} res
  * @return {array<HTMLElement>}
  */
function extractMemberships(res) {
  if (!res) {
    return;
  } else if (!res.html) {
    throw new Error("Invalid response received in extractMemberships: " + JSON.stringify(res));
  }

  var html = document.createElement('div');
  html.innerHTML = res.html;
  // [...qsa] requires a polyfill for chrome <45
  return Array.prototype.slice.call(html.querySelectorAll('.list-membership-container li'));
}

/** Process list of memberships. Sort by checked first.
  * @param {array<HTMLElement>} elements
  * @return {array<HTMLElement>}
*/
export function sortMemberships(elements) {
  if (!elements) return [];

  const isChecked = (el) => el.querySelector('.membership-checkbox').checked;

  // checked lists first
  var sorted = elements.sort(function (a, b) {
    var aChecked = isChecked(a);
    var bChecked = isChecked(b);

    return aChecked === bChecked ? 0 : aChecked ? -1 : 1;
  });

  return sorted;
}

function toHTML(elements) {
  return `<ul class="list-membership-container">
    ${elements.map((e) => e.outerHTML).join('\n')}
  </ul>`
}

/** Get a given user's list memberships
  * @param {string} username
  * @return {Promise<string>} Memberships modal HTML
  */
export function getMemberships(username) {
  return fetchMemberships(username)
    .then(extractMemberships)
    .then(sortMemberships)
    .then(toHTML);
}
