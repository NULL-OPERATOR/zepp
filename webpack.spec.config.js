var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
var WebpackShellPlugin = require('webpack-shell-plugin');


var config = {
  entry: './spec/spec.context.js',
  output: {
    filename: 'testBundle.js'
  },
  target: 'node',
  externals: [nodeExternals()],
  node: {
    fs: 'empty'
  },


  plugins: [
    new WebpackShellPlugin({
      onBuildExit: "mocha --colors --require spec-helper.js testBundle.js --reporter nyan"
    })
  ]
};
