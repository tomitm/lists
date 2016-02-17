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
  var container = document.querySelector("#profile-hover-container");
  var card = container.querySelector(".profile-card");
  if (!card) return;

  var listDiv = document.createElement('div');
  listDiv.className = "ProfileCardLists";
  listDiv.innerHTML = listOfLists;

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
