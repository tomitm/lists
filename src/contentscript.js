import {setupSidebar} from './sidebar.js';
import {setupProfileCard} from './profile-card.js';

function setup() {
  setupSidebar();
  setupProfileCard();
}

var lastpath = window.location.pathname;
function init() {
  setup();

  // detect path change to setup on new page
  setInterval(() => {
    if (window.location.pathname === lastpath) {
      return;
    }
    lastpath = window.location.pathname;
    setup();
  }, 500);
}

window.addEventListener("load", init);
