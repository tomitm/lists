import {getLists} from './lists.js';
import {fetchTemplate} from './twitter.js';

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

function appendProfileHovercard(listOfLists) {
  var card = document.querySelector("#profile-hover-container .profile-card");
  if (!card) return;

  var listDiv = document.createElement('div');
  listDiv.className = "ProfileCardLists";
  listDiv.innerHTML = listOfLists;

  card.appendChild(listDiv);
}

function getCardUserId() {
  var container = document.querySelector("#profile-hover-container");
  if (!container) return;
  return container.attributes.getNamedItem("data-user-id").value;
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
