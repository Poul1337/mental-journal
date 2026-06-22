// @ts-check
import { nestJsConfig } from "@repo/eslint-config/nestjs";

export default [
  ...nestJsConfig,
  {
    ignores: ["src/generated/**"],
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
