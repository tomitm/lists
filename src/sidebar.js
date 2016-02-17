import {getLists} from './lists.js';

function createListOfLists(meta) {
  var linkList = meta.map(list =>
                  `<li>
                    <a class="js-nav" href="${list.href}">${list.name}</a>
                  </li>`)
                  .join('\n');

  return `<ul class="list-of-lists">${linkList}</ul>`;
}

function createListsModule(listOfLists) {
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
  if (!dashboard) {
    // bail if we can't find the dashboard; nothing to append to
    return;
  }
  var listsElement = document.createElement('div');
  listsElement.className = 'Lists module';
  dashboard.appendChild(listsElement);
  listsElement.innerHTML = html;
}

export function setupSidebar() {
  var listOfLists = document.getElementsByClassName('list-of-lists')[0];
  if (!!listOfLists) {
    // bail if there's already lists on the page
    return;
  }

  getLists()
    .then(createListOfLists)
    .then(createListsModule)
    .then(addSidebar)
    .catch((err) => { console.debug("[lists]", err); });
}
