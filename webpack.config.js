const webpack = require('webpack')
const path = require('path')
const MinifyPlugin = require("babel-minify-webpack-plugin")

module.exports = {
    // entry: "./src/game.js",
    // context
    entry: {
        script: path.resolve(__dirname, "./src/main.js")
    },
    output: {
        path: __dirname,
        filename: "./build/bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" },
            {
              test: /\.js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ["es2017", "stage-0"]
                }
              }
            }
        ]
    },
    plugins: [
      // new webpack.optimize.UglifyJsPlugin(),
      // new MinifyPlugin()
      // new HtmlWebpackPlugin({template: './src/index.html'})
    ],
    devServer: {
      contentBase: path.join(__dirname, 'build')
    }
}
