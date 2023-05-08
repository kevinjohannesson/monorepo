module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "plugin:react/recommended",
    "standard-with-typescript",
    "plugin:prettier/recommended",
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json"],
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "prettier/prettier": [
      "error",
      { singleQuote: false, trailingComma: "all" },
    ],
    "sort-imports-es6-autofix/sort-imports-es6": "error",
  },
  plugins: ["react", "sort-imports-es6-autofix"],
  settings: {
    react: {
      version: "detect",
    },
  },
};
