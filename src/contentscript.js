import setupSidebar from './sidebar.js';
import setupProfileCard from './profile-card.js';
import setupErrorHandling from './error-reporting.js';

function setup(pageChange) {
  setupErrorHandling(pageChange);
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
