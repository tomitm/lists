import { getLists } from './util/lists.js';
import { getUsername } from './util/twitter.js';
import { addChangeListener } from './util/preferences.js';
import { captureException } from './util/error-reporting.js';

import { createPrefsDropdown, setupPrefsDropdown } from './preferences.js';

function createListOfLists(meta) {
  // TODO: show an appropriate message instead when 0 lists
  if (!meta || meta.length === 0) return;

  let current = null;
  const listCard = document.querySelector('.list-follow-card');
  if (listCard) {
    current = listCard.dataset.listId;
  }

  const linkList = meta.map((list) => {
    const active = current === list.listId;
    return `<li ${active ? 'class="active"' : ''}>
      <a class="list-link js-nav" href="${list.href}">${list.name}</a>
    </li>`;
  }).join('\n');

  return `<ul class="js-nav-links">${linkList}</ul>`;
}

function createListsModule(listOfLists) {
  if (!listOfLists) return;

  // make it feel like part of the dashboard...
  return `<div role="navigation" class="module list-nav">
            <div class="content-header">
              <div class="header-inner">
                ${createPrefsDropdown()}
                <h3>Lists</h3>
              </div>
            </div>
            ${listOfLists}
          </div>`
}

function createListsElement(html) {
  const listsElement = document.createElement('div');
  listsElement.className = 'Lists component lists-redux';
  listsElement.innerHTML = html;
  return listsElement;
}

function addSidebar(html) {
  const sidebar = document.querySelector('.dashboard-left') ||
                document.querySelector('.ProfileSidebar') ||
                document.querySelector('.ProfileSidebar--withRightAlignment');

  // bail if we can't find the dashboard; nothing to append to, or to append
  if (!sidebar || !html) return;

  const listsElement = createListsElement(html);

  const profileCard = sidebar.querySelector('.DashboardProfileCard');
  const footer = sidebar.querySelector('.Trends') || sidebar.querySelector('.Footer');
  if (profileCard) {
    sidebar.insertBefore(listsElement, profileCard.nextSibling);
  } else if (footer) {
    footer.parentNode.insertBefore(listsElement, footer);
  } else {
    sidebar.appendChild(listsElement);
  }
  setupPrefsDropdown();
}

function updateSidebar(html) {
  const existing = document.querySelector('.Lists.component.lists-redux');
  if (!existing) return addSidebar(html);

  const listsElement = createListsElement(html);

  existing.parentNode.replaceChild(listsElement, existing);
  setupPrefsDropdown();
}

function handleExisting() {
  const moreLists = document.querySelector('[data-component-context="more_lists"]');
  if (!moreLists) return; // not already on the page

  const user = moreLists.querySelector('h3 a');
  if (!user) return; // missing username, can't check

  if (user.innerText !== `@${getUsername()}`) return; // noop if for different user

  moreLists.parentNode.removeChild(moreLists);
}

function onChange() {
  getLists()
    .then(createListOfLists)
    .then(createListsModule)
    .then(updateSidebar)
    .catch((err) => {
      captureException(err);
      console.debug('[lists] failed to update sidebar', err);
    });
}

export default function setup() {
  const alreadySetup = !!document.querySelector('.Lists.component.lists-redux');
  if (alreadySetup) return;

  handleExisting();
  addChangeListener(onChange);

  getLists()
    .then(createListOfLists)
    .then(createListsModule)
    .then(addSidebar)
    .catch((err) => {
      captureException(err);
      console.debug('[lists] failed to setup sidebar', err);
    });
}
