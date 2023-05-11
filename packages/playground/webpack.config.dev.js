const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.config.common.js");
const path = require("path");

const devConfig = {
  mode: "development",
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
};

module.exports = merge(commonConfig, devConfig);
