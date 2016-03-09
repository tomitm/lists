import {getUsername} from './twitter.js';
import * as storage from './storage.js';

import dragula from 'dragula';

function reorderFromStorage() {
  var container = document.querySelector('.GridTimeline-items')
  var elements = container.querySelectorAll('.Grid');

  while (container.lastChild) {
    container.removeChild(container.lastChild);
  }

  storage.get("lists").then(({lists}) => {
    var sorted = [...elements]
      .map((element) => { // give each element a listIndex if we know it's index
        var {userId, listId} = element.querySelector('.ProfileListItem').dataset;
        var index = lists.findIndex((list) => list.userId === userId && list.listId === listId);
        if (index != -1) {
          element.dataset.listIndex = index;
        }
        return element;
      })
      .sort((a, b) => { // sort the elements
        var aIndex = a.dataset.listIndex;
        var bIndex = b.dataset.listIndex;

        if (!aIndex && !bIndex) return 0;   // neither defined
        if (!!aIndex && !bIndex) return 1;  // indexed on top, new on bottom
        if (!aIndex && !!bIndex) return -1;

        if (aIndex < bIndex) return -1;
        if (aIndex > bIndex) return 1;

        return 0;
      })
      .forEach((element) => { // re-add to container
        container.appendChild(element);
      });
  });
}

function getLists() {
  return [...document.querySelectorAll('.ProfileListItem')]
    .map(({dataset}) => {
      return {
        userId: dataset.userId,
        listId: dataset.listId
      }
    });
}

function updateStorage(lists) {
  storage.set({lists})
}

function onDrop() {
  var lists = getLists();
  updateStorage(lists);
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
  reorderFromStorage();
}
