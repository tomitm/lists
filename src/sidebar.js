import { getLists } from './lists.js';
import { getUsername } from './twitter.js';
import { captureException } from './error-reporting.js';

function createListOfLists(meta) {
  // TODO: show an appropriate message instead when 0 lists
  if (!meta || meta.length === 0) return;

  var linkList = meta.map(list => {
    var icon = list.isPrivate ?
        '<span class="Icon Icon--smallest Icon--protected" title="Private list"></span>'
        : '';
    return `<li>
      <a class="js-nav" href="${list.href}">${icon}${list.name}</a>
    </li>`;
  }).join('\n');

  return `<ul class="list-of-lists">${linkList}</ul>`;
}

function createListsModule(listOfLists) {
  if (!listOfLists) return;

  var allHref = `/${getUsername()}/lists`;

  // make it feel like part of the dashboard...
  return `<div class="lists-inner">
            <div class="flex-module">
              <div class="flex-module-header">
                <h3><a href="${allHref}">Lists</a></h3>
              </div>
              <div class="flex-module-inner">${listOfLists}</div>
            </div>
          </div>`;
}

function addSidebar(html) {
  var dashboard = document.getElementsByClassName('dashboard-left')[0];

  // bail if we can't find the dashboard; nothing to append to, or to append
  if (!dashboard || !html) return;

  var listsElement = document.createElement('div');
  listsElement.className = 'Lists module lists-redux';
  dashboard.appendChild(listsElement);
  listsElement.innerHTML = html;
}

function handleExisting() {
  var moreLists = document.querySelector('[data-component-context="more_lists"]');
  if (!moreLists) return; // not already on the page

  var user = moreLists.querySelector('h3 a');
  if (!user) return; // missing username, can't check

  if (user.innerText !== `@${getUsername()}`) return; // noop if for different user

  moreLists.parentNode.removeChild(moreLists);
}

export default function setup() {
  var alreadySetup = !!document.querySelector('.module.Lists.lists-redux');
  if (alreadySetup) return;

  handleExisting();

  getLists()
    .then(createListOfLists)
    .then(createListsModule)
    .then(addSidebar)
    .catch((err) => {
      captureException(err);
      console.debug("[lists] failed to setup sidebar", err);
    });
}
