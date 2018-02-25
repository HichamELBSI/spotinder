module.exports = {
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    es6: true,
    jest: true,
    browser: true
  },
  extends: ["airbnb", "prettier", "prettier/react"],
  plugins: ["react", "prettier"],
  rules: {
    strict: 0,
    "consistent-return": 0,
    "global-require": 0,
    camelcase: 0,
    "prettier/prettier": 0,
    "react/jsx-filename-extension": 0,
    "react/no-danger": 0,
    "react/require-default-props": 0,
    "react/no-array-index-key": 0,
    "react/sort-comp": 0,
    "react/no-unused-prop-types": 0,
    "react/prop-types": 0,
    "import/no-dynamic-require": 0,
    "import/no-extraneous-dependencies": 0,
    "import/no-named-as-default": 0,
    "jsx-a11y/anchor-is-valid": 0
  }
};
