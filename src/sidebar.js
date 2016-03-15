import { getLists } from './lists.js';
import { captureException } from './error-reporting.js';

function createListOfLists(meta) {
  // TODO: show an appropriate message instead when 0 lists
  if (!meta || meta.length === 0) return;

  var linkList = meta.map(list =>
                  `<li>
                    <a class="js-nav" href="${list.href}">${list.name}</a>
                  </li>`)
                  .join('\n');

  return `<ul class="list-of-lists">${linkList}</ul>`;
}

function createListsModule(listOfLists) {
  if (!listOfLists) return;

  // make it feel like part of the dashboard...
  return `<div class="lists-inner">
            <div class="flex-module">
              <div class="flex-module-header">
                <h3>Lists</h3>
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
  listsElement.className = 'Lists module';
  dashboard.appendChild(listsElement);
  listsElement.innerHTML = html;
}

export default function setup() {
  var listOfLists = document.getElementsByClassName('list-of-lists')[0];

  // bail if there's already lists on the page
  if (!!listOfLists) return;

  getLists()
    .then(createListOfLists)
    .then(createListsModule)
    .then(addSidebar)
    .catch((err) => {
      captureException(err);
      console.debug("[lists] failed to setup sidebar", err);
    });
}
