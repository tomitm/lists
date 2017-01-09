import Raven from 'raven-js';

/* eslint-disable no-undef */ // handled by rollup-config-replace
const id = __CHROME_WEBSTORE_ID__;
const version = __VERSION__;
const env = __ENV__;
const dsn = __RAVEN_DSN__;
/* eslint-enable no-undef */

const extensionExpr = new RegExp(`^chrome-extension://${id}/.*`);

const config = {
  release: version,
  environment: env,
  whitelistUrls: [extensionExpr],
  includePaths: [extensionExpr]
};

export function captureException(...args) {
  // 'raven-js' isn't being properly exported
  if (env === 'production') {
    return Raven.captureException(...args);
  }
}

export default function setup(pageChange) {
  if (pageChange) return;

  if (env === 'production') {
    Raven.config(dsn, config).install();
  }
}
