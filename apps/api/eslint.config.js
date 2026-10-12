import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "src/generated/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
);
