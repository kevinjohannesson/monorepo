const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.config.common.js");

const prodConfig = {
  mode: "production",
};

module.exports = merge(commonConfig, prodConfig);
