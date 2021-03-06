const webpack = require("webpack");
const path = require("path");
const nodeExternals = require("webpack-node-externals");
const dotenv = require('dotenv');

try {
  dotenv.config({
    path: '.env',
  });
} catch (e) {
  process.stdout.write('Unable to load environment variables. Skipping...');
}

module.exports = {
  entry: ["webpack/hot/poll?100", "./src/index.ts"],
  watch: false,
  target: "node",
  externals: [
    nodeExternals({
      whitelist: ["webpack/hot/poll?100"]
    })
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  mode: "development",
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "index.js"
  }
};
