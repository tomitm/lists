import { getMemberships } from './util/memberships.js';
import { postForm, observeChanges } from './util/twitter.js';
import { captureException } from './util/error-reporting.js';

let hoverContainer = null;
function getHoverContainer() {
  if (hoverContainer !== null) {
    return hoverContainer;
  }
  hoverContainer = document.querySelector('#profile-hover-container');
  return hoverContainer;
}

/** Click handler for list, part one. Just handles the user's click
 *  and does the grunt work of figuring out relevant elements.
  * @param {MouseEvent} e - Event from click handler
  */
function listClick(e) {
  e.preventDefault(); // for click on checkbox

  const containerEl = getHoverContainer();
  let listEl;

  if (e.target.tagName === 'LI') {
    listEl = e.target;
  } else {
    // clicked on a span/input/etc, use the path to work our way up the path
    const targets = e.path.filter((el) => el.tagName === 'LI');
    if (targets.length < 1) return;
    listEl = targets[0];
  }

  // fun story: e.preventDefault() is useless on a checkbox in the event handler
  // it visually prevents change, but in the handler, checked is the new state
  setTimeout(() => addUserToList(listEl, containerEl), 0);
}

/** Click handler for list, part two.
 *  take the list <li> target, deterime the user and list
  * then send it off to the server to add/remove from the user from that list.
  * Behaviour should be exactly like the normal add list menu.
  * @param {Element} listEl - Target list element that was clicked on
  * @param {Element} containerEl - Hover container element
 */
function addUserToList(listEl, containerEl) {
  // if we somehow failed to get either element, bail as they're essential
  if (!listEl || !containerEl) return;

  const listId = listEl.dataset.listId;
  const userId = containerEl.dataset.userId;
  const inputEl = listEl.children[`list_${listId}`];

  // Twitter has a cute little pending animation while loading, let's use it.
  listEl.className = 'pending';
  function clearPending() {
    listEl.className = null;
  }

  const data = {};
  if (inputEl.checked) { // user is already a list member, removing instead
    data._method = 'DELETE';  // eslint-disable-line no-underscore-dangle
  }
  postForm(`/i/${userId}/lists/${listId}/members`, data)
    .then(() => {
      inputEl.checked = !inputEl.checked;
    })
    .then(clearPending, clearPending); // .finally didn't make it into spec?!
}

/** Take the list memberships and append them to the profile card, then
  * adjust the height if necessary.
  * @param {string} listOfLists - Lists to append to profile card
  */
function appendProfileHovercard(listOfLists) {
  if (!listOfLists) return;

  const container = getHoverContainer();
  if (!container) return;
  const card = container.querySelector('.profile-card');
  if (!card) return;

  const listDiv = document.createElement('div');
  listDiv.className = 'ProfileCardLists';
  listDiv.innerHTML = listOfLists;
  listDiv.addEventListener('click', listClick);

  const initialCardHeight = card.offsetHeight;
  card.appendChild(listDiv);

  // adjust gravity-south cards for the additional list height
  const south = card.className.split(' ').indexOf('gravity-south') > 0;
  if (south) {
    const diff = card.offsetHeight - initialCardHeight;
    container.style.transform = `translate(0, -${diff}px)`;
  } else {
    container.style.transform = null; // reset value from south
  }
}

/** Get the userId for the user the card belongs to.
  * @return {string} - userId of the user the card belongs to
  */
function getCardUserId() {
  const container = getHoverContainer();
  if (!container) return;
  return container.dataset.userId;
}

/** Update the profile card with the user's list memberships.
  */
function updateProfileHovercard() {
  const userId = getCardUserId();
  if (!userId) return;

  getMemberships(userId)
    .then(appendProfileHovercard)
    .catch((err) => {
      captureException(err);
      console.warn('[lists] failed to setup profile card', err);
    });
}

/** Initial setup for the profile card feature
  * @param {boolean} [pageChange=false] - If called as a result of page changed
  */
export default function setup(pageChange) {
  if (pageChange) return;

  // The attribute is changed first, but need to wait until the child nodes are
  // added otherwise the element we append to isn't there.
  const config = { childList: true };
  const target = getHoverContainer();

  // Twitter keeps #profile-hover-container around and updates the child nodes
  // on hover, so observe that. Sadly don't have direct access to their events.
  observeChanges(target, (mutations) => {
    // only update when nodes added (user info inserted)
    if (mutations[0].addedNodes.length <= 0) return;
    updateProfileHovercard();
  }, config);
}
