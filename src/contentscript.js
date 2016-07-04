import setupSidebar from './sidebar.js';
import setupProfileCard from './profile-card.js';
import setupErrorHandling from './error-reporting.js';
import setupModal from './modal.js';

import { isLoggedIn, observeChanges } from './twitter.js';

function setup(pageChange) {
  setupErrorHandling(pageChange);
  setupSidebar(pageChange);
  setupProfileCard(pageChange);
  setupModal(pageChange);
}

function init() {
  if (!isLoggedIn()) {
    console.debug('[lists] Not logged in, waiting to init until you are.');
    return;
  }

  setup();
  observeChanges("head link[rel='canonical']", () => setup(true));
}

init();
