import {getMemberships} from './lists.js';
import {postForm, fetchTemplate} from './twitter.js';

var hoverContainer = null;
function getHoverContainer() {
  if (!!hoverContainer) {
    return hoverContainer;
  }
  hoverContainer = document.querySelector("#profile-hover-container");
  return hoverContainer;
}

/** Click handler for list - take the list <li> target, deterime the user and list
  * then send it off to the server to add/remove from the user from that list.
  * Behaviour should be exactly like the normal add list menu.
  * @param {MouseEvent} e
  */
function listClick(e) {
  e.preventDefault(); // for click on checkbox

  var containerEl = getHoverContainer();
  var listEl;

  if (e.target.tagName === "LI") {
    listEl = e.target;
  } else {
    // clicked on a span/input/etc, use the path to work our way up the path
    var targets = e.path.filter((el) => el.tagName === "LI");
    if (targets.length < 1) return;
    listEl = targets[0];
  }

  // if we somehow failed to get either element, bail as they're essential
  if(!listEl || !containerEl) return;

  var listId = listEl.dataset.listId;
  var userId = containerEl.dataset.userId;
  var inputEl = listEl.children[`list_${listId}`];

  // Twitter has a cute little pending animation while loading, let's use it.
  listEl.className = "pending";
  function clearPending() {
    listEl.className = null;
  }

  var data = {};
  if (inputEl.checked) { // user is already a list member, removing instead
    data._method = "DELETE";
  }
  postForm(`/i/${userId}/lists/${listId}/members`, data)
    .then(() => {
      inputEl.checked = !inputEl.checked;
    })
    .then(clearPending, clearPending); // .finally didn't make it into spec?!
}

/** Take the list memberships and append them to the profile card, then
  * adjust the height if necessary.
  * @param {string} listOfLists
  */
function appendProfileHovercard(listOfLists) {
  var container = getHoverContainer();
  var card = container.querySelector(".profile-card");
  if (!card) return;

  var listDiv = document.createElement('div');
  listDiv.className = "ProfileCardLists";
  listDiv.innerHTML = listOfLists;
  listDiv.addEventListener("click", listClick);

  var initialCardHeight = card.offsetHeight;
  card.appendChild(listDiv);

  // adjust gravity-south cards for the additional list height
  var south = card.className.split(" ").indexOf("gravity-south") > 0;
  if (south) {
    var diff = card.offsetHeight - initialCardHeight;
    container.style.transform = `translate(0, -${diff}px)`
  } else {
    container.style.transform = null; // reset value from south
  }
}

/** Get the userId for the user the card belongs to.
  * @return {string}
  */
function getCardUserId() {
  var container = getHoverContainer();
  if (!container) return;
  return container.dataset.userId;
}

/** Update the profile card with the user's list memberships.
  */
function updateProfileHovercard() {
  var userId = getCardUserId();
  if (!userId) return;

  getMemberships(userId)
    .then(appendProfileHovercard)
    .catch((err) => {
      console.warn("[lists] failed to setup profile card", err);
    });
}

/** Initial setup for the profile card feature
  * @param {boolean} [pageChange=false] - If called as a result of page changed
  */
export function setupProfileCard(pageChange) {
  if (pageChange) return;

  // Twitter keeps #profile-hover-container around and updates the child nodes
  // on hover, so observe that. Sadly don't have direct access to their events.
  var observer = new MutationObserver((mutations) => {
    // only update when nodes added (user info inserted)
    if (mutations[0].addedNodes.length <= 0) return;
    updateProfileHovercard();
  });

  // The attribute is changed first, but need to wait until the child nodes are
  // added otherwise the element we append to isn't there.
  var config = { childList: true };
  var target = getHoverContainer();
  observer.observe(target, config);
}
