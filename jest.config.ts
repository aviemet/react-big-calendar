import { pathsToModuleNameMapper, JestConfigWithTsJest } from "ts-jest"
import { compilerOptions } from "./tsconfig.json"

const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  clearMocks: true,
  moduleDirectories: ["node_modules", "src"],
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "/node_modules/(?!(lodash-es)/)",
  ],
}

// eslint-disable-next-line import/no-default-export
export default config
