import { sortMemberships } from './util/memberships.js';
import { observeChanges } from './util/twitter.js';

var modalContainer = null;
function getModalContentElement() {
  if (!!modalContainer) {
    return modalContainer;
  }
  modalContainer = document.querySelector('#list-membership-dialog .list-membership-content');
  return modalContainer;
}

/**
  * Sort the 'Add or remove from lists...' dialog when it opens.
*/
function updateLists() {
  var ul = getModalContentElement().querySelector('.list-membership-container');
  // [...qsa] requires a polyfill
  var memberships = Array.prototype.slice.call(ul.querySelectorAll('li'));
  // sort, then re-insert/order into DOM, maintaining references/listeners
  sortMemberships(memberships)
    .forEach((li) => ul.insertBefore(li, null));
}

export default function setup(pageChange) {
  if (pageChange) return;

  // The attribute is changed first, but need to wait until the child nodes are
  // added otherwise the element we append to isn't there.
  var config = { childList: true };
  var target = getModalContentElement();

  // Twitter keeps #list-membership-dialog around and updates the child nodes
  // on open, so observe that. Sadly don't have direct access to their events.
  observeChanges(target, (mutations) => {
    // only update when nodes added (memberships inserted)
    if (mutations[0].addedNodes.length <= 0) return;
    updateLists();
  }, config);
}
