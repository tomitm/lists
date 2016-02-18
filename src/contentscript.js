import {setupSidebar} from './sidebar.js';
import {setupProfileCard} from './profile-card.js';

function setup(pageChange) {
  setupSidebar(pageChange);
  setupProfileCard(pageChange);
}

function init() {
  setup();

  var observer = new MutationObserver(() => {
    setup(true);
  });
  var target = document.querySelector("head link[rel='canonical']");
  var config = { attributes: true };
  observer.observe(target, config);
}

init();
