import Raven from 'raven-js';

const environment = process.env.NODE_ENV;
const extensionExpr = new RegExp(`^chrome-extension://${process.env.EXTENSION_ID}/.*`);

const config = {
  environment,
  release: process.env.VERSION,
  whitelistUrls: [extensionExpr],
  includePaths: [extensionExpr]
};

export function captureException(...args) {
  // 'raven-js' isn't being properly exported
  if (environment === 'production') {
    return Raven.captureException(...args);
  }
}

export default function setup(pageChange) {
  if (pageChange) return;

  if (environment === 'production') {
    Raven.config(process.env.RAVEN_DSN, config).install();
  }
}
