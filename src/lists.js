import { getUsername, fetchTemplate } from './twitter.js';

/** Get a subset of a user's lists from Twitter.
  * @param {string} username
  * @param {string} position - min_position from the response of this request
  * @return {Promise<object>} The good stuff is in the items_html property
  **/
function _fetchLists(username, position) {
  if (!username) {
    console.debug('[lists] Unable to fetch lists; no username');
    return Promise.resolve();
  }

  var params = [
    'include_available_features=1',
    'include_entities=1',
    'reset_error_state=false'
  ];
  if (position) {
    params.push(`max_position=${position}`);
  }
  params = '?' + params.join('&');

  return fetchTemplate(`/i/lists/lists/${username}/timeline${params}`);
}

/** Get all a user's lists from Twitter. This will return raw template-ish output.
  * This is right off of what you'd find on your real lists page, actually.
  * If has_more_items, then it will recursively request until there are no more.
  * @param {string} username
  * @param {string} [position] - min_position, used as a pagination cursor
  * @param {string} [_html=''] - internal use
  * @return {Promise<string>} Template HTML as a string.
*/
function fetchLists(username, position = -1, _html = "") {
  return _fetchLists(username, position).then((res) => {
    if (!res) {
      return;
    } else if (!res.items_html) {
      throw new Error('Invalid response received in fetchLists: ' + JSON.stringify(res));
    }

    _html += res.items_html;
    if (res.has_more_items && res.min_position !== null) {
      return fetchLists(username, res.min_position, _html);
    }
    return _html;
  });
}

/** Extract the list elements from Twitter's template.
  * @param {string} res - Twitter's template response as an HTML string.
  * @return {array<HTMLElement>} - Twitter's template response as HTMLELements
  **/
function extractLists(html) {
  // lists are the .ProfileListItem elements.
  var page = document.createElement('div');
  page.innerHTML = html;
  // [...qsa] requires a polyfill for chrome <45
  return Array.prototype.slice.call(page.querySelectorAll('.ProfileListItem'));
}

/** Convert elements into sweet JSON metadata for our use.
  * @param {array<HTMLElement>} - Twitter's template as HTMLELements
  * @return {array<object>} - Accessible list info
  */
function getMetadata(elements) {
  if (!elements) return [];

  // convert elements to metadata, so we can easily use it
  return elements.map(function (element) {
    var { userId, listId } = element.dataset;
    var { innerText: name, href } = element.querySelector('.ProfileListItem-name');
    var isPrivate = !!element.querySelector('.Icon--protected');
    return { name, href, isPrivate, userId, listId };
  });
}

/** Fetch the list memberships for the given user in the current users' lists.
  * This is a raw HTML template that Twitter uses on the add to list modal.
  * @param {string} username
  * @return {Promise<object>} - The good stuff is in the html property
  */
function fetchMemberships(username) {
  if (!username) return Promise.resolve();

  return fetchTemplate(`/i/${username}/lists`);
}

/** Extract the HTML from the JSON payload and grab just the container.
  * @param {Object} res
  * @return {string}
  */
function extractMemberships(res) {
  if (!res) {
    return;
  } else if (!res.html) {
    throw new Error("Invalid response received in extractMemberships: " + JSON.stringify(res));
  }

  var html = document.createElement('div');
  html.innerHTML = res.html;
  return html.querySelector('.list-membership-container').outerHTML;
}


var lists = null;

/** Get the current user's lists.
  * @return {Promise<array<object>>} lists
  */
export function getLists() {
  if (lists) return lists;

  var username = getUsername();
  lists = fetchLists(username)
    .then(extractLists)
    .then(getMetadata);

  // on failure, reset so we can try again later
  lists.then((result) => {
    if (!result) return Promise.reject()
    return result;
  }).catch(() => { lists = null; });

  return lists;
}

/** Get a given user's list memberships
  * @param {string} username
  * @return {Promise<string>} Memberships modal HTML
  */
export function getMemberships(username) {
  return fetchMemberships(username)
    .then(extractMemberships);
}
