import {getLists} from './lists.js';
import {postForm, fetchTemplate} from './twitter.js';

function fetchLists(username) {
  if (!username) {
    return Promise.reject("No username.");
  }

  return fetchTemplate(`/i/${username}/lists`);
}

function extractLists(res) {
  if (!res.html) {
    return Promise.reject("Invalid response received");
  }

  var html = document.createElement('div');
  html.innerHTML = res.html;
  return html.querySelector('.list-membership-container').outerHTML;
}

function listClick(e) {
  e.preventDefault(); // for click on checkbox

  var containerEl = document.querySelector("#profile-hover-container");
  var listEl;

  if (e.target.tagName === "LI") {
    listEl = e.target;
  } else {
    var targets = e.path.filter((el) => el.tagName === "LI");
    if (targets.length < 1) return;
    listEl = targets[0];
  }

  if(!listEl || !containerEl) return;

  var listId = listEl.dataset.listId;
  var userId = containerEl.dataset.userId;
  var inputEl = listEl.children[`list_${listId}`];

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

function appendProfileHovercard(listOfLists) {
  var container = document.querySelector("#profile-hover-container");
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

function getCardUserId() {
  var container = document.querySelector("#profile-hover-container");
  if (!container) return;
  return container.dataset.userId;
}

function updateProfileHovercard() {
  var userId = getCardUserId();
  if (!userId) return;

  fetchLists(userId)
    .then(extractLists)
    .then(appendProfileHovercard);
}

export function setupProfileCard(pageChange) {
  if (pageChange) return;

  var observer = new MutationObserver((mutations) => {
    // only update when nodes added (user info inserted)
    if (mutations[0].addedNodes.length <= 0) return;
    updateProfileHovercard();
  });
  var target = document.querySelector("#profile-hover-container");
  var config = { childList: true };
  observer.observe(target, config);
}
