import agentStrict from "eslint-config-agent-strict";

export default [
  ...agentStrict,
  {
    // Overrides for Pi extensions
    settings: {
      react: {
        version: "18.3.1", // Hardcode react version instead of "detect" to avoid contextOrFilename.getFilename error in ESLint v10
      },
    },
    rules: {
      // Pi extensions often require using 'any' to interact with internal untyped APIs
      "@typescript-eslint/no-explicit-any": "off",
      // This is not a Next.js project, so disable the pages directory check
      "@next/next/no-html-link-for-pages": "off",
    }
  }
];
