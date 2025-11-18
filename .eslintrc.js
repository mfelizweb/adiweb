/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "next",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "react-hooks/rules-of-hooks": "off",
    "@next/next/no-img-element": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off"
  }
}
