require('dotenv').config();

const path = require('path');
const slsw = require('serverless-webpack');
const TerserPlugin = require('terser-webpack-plugin');

const { isLocal } = slsw.lib.webpack;

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  mode: isLocal ? 'development' : 'production',
  devtool: isLocal ? 'eval' : 'none',
  optimization: {
    minimize: !isLocal,
    usedExports: true,
    sideEffects: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        cache: true,
        parallel: true,
        extractComments: false,

      }),
    ],
  },
  watch: isLocal,
  watchOptions: {
    ignored: /(node_modules)/,
  },
  externals: [
    'pg-hstore',
    '@azure/identity',
    '@azure/keyvault-secrets',
  ],
  output: {
    libraryTarget: 'commonjs2',
    library: 'index',
    path: path.resolve(process.cwd(), '.webpack'),
    filename: '[name].js',
  },
  module: {
    rules: [{
      test: /\.js/,
      exclude: /(node_modules)/,
      use: [{
        loader: 'babel-loader',
      }],
    }],
  },
};
