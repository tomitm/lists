const path = require('path');
const { EnvironmentPlugin, LoaderOptionsPlugin } = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');
const SentryPlugin = require('webpack-sentry-plugin');

const pkg = require('./package.json');

const productionVars = ['NODE_ENV', 'RAVEN_DSN', 'EXTENSION_ID']
const releaseVars = ['SENTRY_BASE', 'SENTRY_ORG', 'SENTRY_PROJECT', 'SENTRY_API_KEY']

function validateEnv(keys) {
  return keys.filter(key => !!process.env[key])
    .length === keys.length;
}

module.exports = function({env, release} = {}) {
  process.env.NODE_ENV = env;

  const config = {
    entry: {
      contentscript: './src/contentscript.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }
      ]
    },
    devtool: 'source-map',
    plugins: [
      new EnvironmentPlugin({
        VERSION: pkg.version,
        NODE_ENV: 'development',
        RAVEN_DSN: '',
        EXTENSION_ID: ''
      })
    ],
    target: 'web',
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'app')
    }
  }

  if (env === 'production') {
    if (!validateEnv(productionVars)) {
      throw new Error('Missing a production environment variable.');
    }

    config.plugins.push(
      new LoaderOptionsPlugin({
        minimize: true
      }),
      new BabiliPlugin()
    )
  }

  if (release) {
    if (!validateEnv(releaseVars)) {
      throw new Error('Missing a release environment variable.');
    }

    config.plugins.push(
      new SentryPlugin({
        baseSentryURL: process.env.SENTRY_BASE,
        organisation: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        apiKey: process.env.SENTRY_API_KEY,
        release: pkg.version
      })
    )
  }

  return config;
};
