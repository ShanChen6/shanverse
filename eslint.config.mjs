import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,

   // Thêm phần cấu hình dưới đây để tắt cảnh báo prop-types
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "react/prop-types": "off",
    },
  },
]);
