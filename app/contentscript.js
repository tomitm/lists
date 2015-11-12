'use strict';

function getUsername() {
  // username is conveniently available as a data property on an element
  var user = document.getElementsByClassName('js-mini-current-user')[0];
  if (!user) {
    return;
  }
  return user.dataset.screenName;
}

function fetchLists(username) {
  if (!username) {
    return Promise.reject("No username.");
  }

  // we're part of the page, so do as Twitter does.
  // downside is their cookies only have template access, so no clean API,
  // but it allows this can work out of the box since OAuth isn't needed.
  var options = {
    credentials: 'include',
    headers: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'x-push-state-request': true // required to return template
    }
  };
  return fetch(`/${username}/lists`, options)
    .then(res => res.json());
}

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

function getMetadata(elements) {
  if (!elements) {
    return [];
  }
  // convert elements to metadata
  return elements.map(function (element) {
    return {
      name: element.innerText,
      href: element.href
    };
  });
}

function createListsModule(meta) {
  // make it feel like part of the dashboard...
  var linkList = meta.map(list =>
                  `<li>
                    <a class="js-nav" href="${list.href}">${list.name}</a>
                  </li>`)
                  .join('');

  return `<div class="lists-inner">
            <div class="flex-module">
              <div class="flex-module-header">
                <h3>Lists</h3>
              </div>
              <div class="flex-module-inner">
                <ul class="list-of-lists">${linkList}</ul>
              </div>
            </div>
          </div>`;
}

function addToPage(html) {
  var dashboard = document.getElementsByClassName('dashboard-left')[0];
  if (!dashboard) {
    // bail if we can't find the dashboard; nothing to append to
    return;
  }
  var listsElement = document.createElement('div');
  listsElement.className = 'Lists module';
  dashboard.appendChild(listsElement);
  listsElement.innerHTML = html;
}

function setup() {
  var listOfLists = document.getElementsByClassName('list-of-lists')[0];
  if (!!listOfLists) {
    // bail if there's already lists on the page
    return;
  }

  var username = getUsername();
  fetchLists(username)
    .then(extractLists)
    .then(getMetadata)
    .then(createListsModule)
    .then(addToPage)
    .catch((err) => { console.debug("[lists]", err); });
}

// check for path change
var lastpath = window.location.pathname;
setInterval(function() {
  if (window.location.pathname === lastpath) {
    return;
  }
  lastpath = window.location.pathname;
  setup();
}, 500);

window.addEventListener("load", setup);
