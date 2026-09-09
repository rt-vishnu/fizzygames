import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The bundled games are standalone ES5 files with their own conventions;
    // they are not part of the app's module graph.
    "public/games/**",
    // Browser-game regression tests run directly under Node's test runner.
    "tests/**",
  ]),
]);

export default eslintConfig;
