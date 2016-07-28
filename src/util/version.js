import * as storage from './storage.js';

/* eslint-disable no-undef */ // handled by rollup-config-replace
const version = __VERSION__;
/* eslint-enable no-undef */

const VERSION_KEY = 'version';

export default function setup(pageChange) {
  if (pageChange) return;

  storage.get(VERSION_KEY).then(({ version: previousVersion }) => {
    if (previousVersion === version) return;

    // future: possible upgrade logic
    storage.set({ version });
  });
}
