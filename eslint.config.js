import { fixupPluginRules } from "@eslint/compat"
import stylistic from "@stylistic/eslint-plugin"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import tsParser from "@typescript-eslint/parser"
import storybook from "eslint-plugin-storybook"
import importPlugin from "eslint-plugin-import"
import checkFile from "eslint-plugin-check-file"
import jestPlugin from "eslint-plugin-jest"

const rules = {
  "react/jsx-uses-react": "off",
  "react/react-in-jsx-scope": "off",
  "@stylistic/indent": ["error", 2, {
    SwitchCase: 1,
    VariableDeclarator: "first",
    MemberExpression: 1,
    ArrayExpression: 1,
    ignoredNodes: [
      "TSTypeParameterInstantiation",
    ],
  }],
  "@stylistic/brace-style": ["error", "1tbs", {
    allowSingleLine: true,
  }],
  "@stylistic/object-curly-spacing": ["error", "always", {
    objectsInObjects: true,
  }],
  "@stylistic/jsx-curly-spacing": ["error", {
    when: "always",
    children: true,
  }],
  "@stylistic/member-delimiter-style": ["error", {
    multiline: {
      delimiter: "none",
    },
    singleline: {
      delimiter: "comma",
    },
    multilineDetection: "brackets",
  }],
  "@stylistic/jsx-one-expression-per-line": "off",
  "@stylistic/keyword-spacing": ["error", {
    after: true,
    before: true,
    overrides: {
      if: { after: false },
      for: { after: false },
      while: { after: false },
      switch: { after: false },
      catch: { after: false },
      import: { after: true },
      export: { after: true },
    },
  }],
  "@stylistic/comma-dangle": ["error", {
    arrays: "always-multiline",
    objects: "always-multiline",
    imports: "always-multiline",
    exports: "always-multiline",
    functions: "only-multiline",
  }],
  "@stylistic/multiline-ternary": ["error", "always-multiline"],
  "@stylistic/space-infix-ops": "error",
  "@stylistic/space-unary-ops": ["error", {
    words: true,
    nonwords: false,
    overrides: {
      "!": false,
      "!!": false,
    },
  }],
  "@stylistic/semi": ["error", "never"],
  "@stylistic/jsx-quotes": ["error", "prefer-double"],
  "@stylistic/quotes": ["error", "double"],
  "@stylistic/space-before-function-paren": ["error", "never"],
  "@stylistic/arrow-spacing": "error",
  "@stylistic/space-before-blocks": ["error", "always"],
  "@stylistic/no-multiple-empty-lines": ["error", {
    max: 2,
    maxBOF: 0,
  }],
  "@stylistic/comma-spacing": ["error", {
    before: false,
    after: true,
  }],
  "@stylistic/no-multi-spaces": "error",
  "@stylistic/spaced-comment": ["error", "always", {
    "line": {
      "markers": ["/"],
      "exceptions": ["-", "+"],
    },
    "block": {
      "markers": ["!"],
      "exceptions": ["*"],
      "balanced": true,
    },
  }],
  // "@stylistic/multiline-comment-style":["error", "starred-block"],
  "no-trailing-spaces": ["error", {
    skipBlankLines: false,
    ignoreComments: false,
  }],
  "no-unused-vars": ["warn", {
    vars: "all",
    args: "none",
  }],
  "eqeqeq": "error",
  "no-console": "warn",
  "eol-last": ["error", "always"],
  "import/no-default-export": "error",
  "import/newline-after-import": "error",
  "import/consistent-type-specifier-style": ["error", "prefer-inline"],
  ...reactHooksPlugin.configs.recommended.rules,
}

// eslint-disable-next-line import/no-default-export
export default [
  // Typescript/Javascript files
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    ...stylistic.configs.customize({
      indent: "tab",
    }),
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
    },
    settings: {
      "react": {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
          alwaysTryTypes: true,
        },
        node: true,
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/ignore": [
        "node_modules",
        "\\.(css|scss|sass|less)$",
      ],
    },
    plugins: {
      "react-hooks": fixupPluginRules(reactHooksPlugin),
      "@stylistic": fixupPluginRules(stylistic),
      "check-file": checkFile,
    },
    rules,
  },
  // Storybook
  ...storybook.configs["flat/recommended"],
  {
    files: ["**/stories/**/*", ".storybook/**/*"],
    settings: {
      "import/resolver": {
        alias: {
          map: [
            ["react-big-calendar", "./src"],
          ],
          extensions: [".ts", ".tsx", ".js", ".jsx"],
        },
      },
    },
    rules: {
      "import/no-default-export": "off",
      "import/newline-after-import": "off",
      "import/consistent-type-specifier-style": "off",
    },
  },
  {
    files: ["test/**/*.test.{js,jsx,ts,tsx}"],
    plugins: {
      jest: fixupPluginRules(jestPlugin),
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      ...jestPlugin.configs.style.rules,
      "jest/prefer-expect-assertions": "off",
      "import/no-default-export": "off",
    },
  },
  {
    ignores: [
      "dist/**/*",
      ".vscode/**/*",
      ".yarn/**/*",
      "stories_old/**/*",
      "src_old/**/*",
    ],
  },
]
