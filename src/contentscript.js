import setupPreferences from './util/preferences.js';
import setupErrorHandling from './util/error-reporting.js';
import { isLoggedIn, observeChanges } from './util/twitter.js';

import setupSidebar from './sidebar.js';
import setupProfileCard from './profile-card.js';
import setupModal from './modal.js';

function setup(pageChange) {
  setupPreferences(pageChange);
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
