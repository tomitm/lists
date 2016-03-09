import {getUsername} from './twitter.js';
import * as storage from './storage.js';

import dragula from 'dragula';

export function reorderElements(lists, container, elements, getElementData) {
  [...elements].map((element) => { // give each element a listIndex if we know it's index
    var {userId, listId} = getElementData(element);
    var index = lists.findIndex((list) => list.userId === userId && list.listId === listId);

    if (index !== -1) {
      element.dataset.listIndex = index;
    }
    return element
  })
  .filter((element) => !!element.dataset.listIndex) // filter out unknowns
  .sort((a, b) => { // sort the elements
    var aIndex = a.dataset.listIndex;
    var bIndex = b.dataset.listIndex;

    if (aIndex < bIndex) return -1;
    if (aIndex > bIndex) return 1;

    return 0;
  })
  .reverse() // stack elements on top, unknowns maintain their order at bottom
  .forEach((element) => {
    container.insertBefore(element, container.firstChild)
  })
}

function reorder() {
  var container = document.querySelector('.GridTimeline-items')
  var elements = container.querySelectorAll('.Grid');
  var getElementData = (element) => element.querySelector('.ProfileListItem').dataset;
  getListsFromStorage().then(({lists}) => {
    reorderElements(lists, container, elements, getElementData)
  });
}

export function getListsFromPage() {
  return [...document.querySelectorAll('.ProfileListItem')]
    .map(({dataset}) => {
      return {
        userId: dataset.userId,
        listId: dataset.listId
      }
    });
}

export function getListsFromStorage() {
  return storage.get('lists');
}

function updateStoredLists() {
  var lists = getListsFromPage();
  return storage.set({lists});
}

function onDrop() {
  updateStoredLists();
}

function setupDragulaHandlers(drake) {
  drake.on('drop', onDrop);
}

function setupDragula() {
  var listContainer = document.querySelector('.GridTimeline-items');
  var options = {
    revertOnSpill: true
  };
  var drake = dragula([listContainer], options);
  listContainer.classList.add('drag-ready');
  return drake;
}

export function setupManage() {
  if (window.location.pathname !== `/${getUsername()}/lists`) {
    // must be on own lists page for drag&drop
    return;
  }
  var drake = setupDragula();
  setupDragulaHandlers(drake);
  reorder();
}
