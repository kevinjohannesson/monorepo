const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "src", "index.tsx"),
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "gis-viewer": path.resolve(__dirname, "../gis-viewer"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
};

// const path = require("path");

// module.exports = {
//   entry: "./src/index.tsx",
//   output: {
//     path: path.resolve(__dirname, "public"),
//     filename: "bundle.js",
//   },
//   resolve: {
//     extensions: [".ts", ".tsx", ".js", ".jsx"],
//     alias: {
//       "gis-viewer": path.resolve(__dirname, "../gis-viewer"),
//     },
//   },
//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         exclude: /node_modules/,
//         use: "ts-loader",
//       },
//     ],
//   },
//   devServer: {
//     static: {
//       directory: path.join(__dirname, "public"),
//     },
//     compress: true,
//     port: 3000,
//     open: true,
//   },
// };
