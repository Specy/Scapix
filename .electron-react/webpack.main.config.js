'use strict';

process.env.BABEL_ENV = 'main';

const path = require('path');
const { dependencies, devDependencies } = require('../package.json');
const webpack = require('webpack');

const BabiliWebpackPlugin = require('babili-webpack-plugin');

// https://github.com/zenghongtu/create-electron-react/issues/3
// const whiteListedModules = ['']

// const externals = [
//   ...Object.keys(devDependencies || {}),
//   ...Object.keys(dependencies || {}).filter(
//     d => !whiteListedModules.includes(d)
//   )
// ];

let mainConfig = {
  entry: {
    main: path.join(__dirname, '../src/main/index.js')
  },
  // externals,
  module: {
    rules: [
      {
        test: /\.(js)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  plugins: [new webpack.NoEmitOnErrorsPlugin()],
  resolve: {
    modules: ['src', 'node_modules'],
    extensions: ['.js', '.json', '.node']
  },
  target: 'electron-main'
};

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  );
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    new BabiliWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  );
}

module.exports = mainConfig;
