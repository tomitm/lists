import { getUsername, fetchTemplate } from './twitter.js';
import { preferences, PREF_SORT, SORT_ALPHA } from './preferences.js';

/** Get a subset of a user's lists from Twitter.
  * @param {string} username - Target user
  * @param {string} position - min_position from the response of this request
  * @return {Promise<Object>} The good stuff is in the items_html property
  **/
function fetchListsSubset(username, position) {
  if (!username) {
    console.debug('[lists] Unable to fetch lists; no username');
    return Promise.resolve();
  }

  let params = [
    'include_available_features=1',
    'include_entities=1',
    'reset_error_state=false'
  ];
  if (position) {
    params.push(`max_position=${position}`);
  }
  params = `?${params.join('&')}`;

  return fetchTemplate(`/i/lists/lists/${username}/timeline${params}`);
}

/** Get all a user's lists from Twitter. This will return raw template-ish output.
  * This is right off of what you'd find on your real lists page, actually.
  * If has_more_items, then it will recursively request until there are no more.
  * @param {string} username - Target user
  * @param {string} [position] - min_position, used as a pagination cursor
  * @param {string} [_html=''] - internal use
  * @return {Promise<string>} Template HTML as a string.
*/
function fetchLists(username, position = '-1', _html = '') {
  let html = _html;
  return fetchListsSubset(username, position).then((res) => {
    if (!res) return;

    if (!res.items_html) {
      throw new Error(`Invalid response received in fetchLists: ${JSON.stringify(res)}`);
    }

    html += res.items_html;
    if (res.has_more_items && res.min_position !== null) {
      return fetchLists(username, res.min_position, html);
    }
    return html;
  });
}

/** Extract the list elements from Twitter's template.
  * @param {string} html - Twitter's template response as an HTML string.
  * @return {HTMLElement[]} - Twitter's template response as HTMLELements
  **/
function extractLists(html) {
  // lists are the .ProfileListItem elements.
  const page = document.createElement('div');
  page.innerHTML = html;
  // [...qsa] requires a polyfill for chrome <45
  return Array.prototype.slice.call(page.querySelectorAll('.ProfileListItem'));
}

/** Convert elements into sweet JSON metadata for our use.
  * @param {HTMLElement[]} elements - Twitter's template as HTMLELements
  * @return {Object[]} - Accessible list info
  */
function getMetadata(elements) {
  if (!elements) return [];

  // convert elements to metadata, so we can easily use it
  return elements.map((element) => {
    const { userId, listId } = element.dataset;
    const { innerText: name, href } = element.querySelector('.ProfileListItem-name');
    const isPrivate = !!element.querySelector('.Icon--protected');
    return { name, href, isPrivate, userId, listId };
  });
}

/** Sort lists by preference, otherwise return as-is.
  * @param {Object[]} metadata - Accessible list info.
  * @return {Object[]} - Sorted lists info
  */
function sortLists(metadata) {
  const getName = (list) => list.name.toLowerCase();
  if (preferences[PREF_SORT] === SORT_ALPHA) {
    return metadata.slice().sort((a, b) => {
      const aName = getName(a);
      const bName = getName(b);

      if (aName > bName) return 1;
      if (aName < bName) return -1;
      return 0;
    });
  }
  return metadata;
}

let lists = null;

/** Get the current user's lists. Lists will be cached, so multiple calls will only
  * hit the network once, however sorting is not cached.
  * @return {Promise<Object[]>} lists
  */
export function getLists() {
  if (!lists) {
    const username = getUsername();
    lists = fetchLists(username)
      .then(extractLists)
      .then(getMetadata);

    // on failure, reset so we can try again later
    lists.then((result) => {
      if (!result) return Promise.reject();
      return result;
    }).catch(() => {
      lists = null;
    });
  }

  return lists.then(sortLists);
}
