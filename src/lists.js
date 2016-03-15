import { getUsername, fetchTemplate } from './twitter.js';

/** Get a user's lists from Twitter. This'll return raw template-ish output.
  * This is right off of what you'd find on your real lists page, actually.
  * @param {string} username
  * @return {Promise<object>} The good stuff is in the page property
  **/
function fetchLists(username) {
  if (!username) {
    return Promise.reject("No username.");
  }

  return fetchTemplate(`/${username}/lists`);
}

/** Extract the list elements from Twitter's template.
  * @param {object} res - Twitter's template response as a JSON object of strings.
  * @return {array<HTMLElement>} - Twitter's template response as HTMLELements
  **/
function extractLists(res) {
  if (!res.page) {
    return Promise.reject("Invalid response received.");
  }
  // response seems to be the whole page, but we only really need
  // the ProfileListItem-name <a> elements.
  var page = document.createElement('div');
  page.innerHTML = res.page;
  return [...page.getElementsByClassName('ProfileListItem-name')];
}

/** Convert elements into sweet JSON metadata for our use.
  * @param {array<HTMLElement>} - Twitter's template as HTMLELements
  * @return {array<object>} - Accessible list info
  */
function getMetadata(elements) {
  if (!elements) {
    return [];
  }
  // convert elements to metadata, so we can easily use it
  return elements.map(function (element) {
    return {
      name: element.innerText,
      href: element.href
    };
  });
}

/** Fetch the list memberships for the given user in the current users' lists.
  * This is a raw HTML template that Twitter uses on the add to list modal.
  * @param {string} username
  * @return {Promise<object>} - The good stuff is in the html property
  */
function fetchMemberships(username) {
  if (!username) {
    return Promise.reject("No username.");
  }

  return fetchTemplate(`/i/${username}/lists`);
}

/** Extract the HTML from the JSON payload and grab just the container.
  * @param {Object} res
  * @return {string}
  */
function extractMemberships(res) {
  if (!res.html) {
    return Promise.reject("Invalid response received");
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
  if (lists) {
    return lists;
  }

  var username = getUsername();
  lists = fetchLists(username)
    .then(extractLists)
    .then(getMetadata);

  // on failure, reset so we can try again later
  lists.catch(() => { lists = null; });

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
