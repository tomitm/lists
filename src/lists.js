import {getUsername, fetchTemplate} from './twitter.js';

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

  return lists;
}
