const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/**", "coverage/**"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{
          name: "@rapidaid/protocol-engine/authoring",
          message: "Mobile must load protocols through the verified repository API.",
        }],
        patterns: [{
          group: ["**/protocol-engine/src/**", "../../packages/protocol-engine/**"],
          message: "Mobile must not import raw protocol schemas or package internals.",
        }],
      }],
    },
  },
]);
