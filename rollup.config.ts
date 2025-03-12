import path from "path"
import * as url from "url"
import nodeResolve from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"
import commonjs from "@rollup/plugin-commonjs"
import replace from "@rollup/plugin-replace"
import del from "rollup-plugin-delete"
import terser from "@rollup/plugin-terser"
import pkg from "./package.json"
import typescript from "@rollup/plugin-typescript"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

const input = "./src/index.js"
const name = "ReactBigCalendar"

const babelOptions = {
  exclude: /node_modules/,
  babelHelpers: "runtime",
}
const globals = {
  react: "React",
  "react-dom": "ReactDOM",
}

const commonjsOptions = {
  include: /node_modules/,
}

// eslint-disable-next-line import/no-default-export
export default [
  {
    input,
    output: {
      file: "./dist/react-big-calendar.js",
      format: "umd",
      name,
      globals,
      interop: "auto",
    },
    external: Object.keys(globals).push(/@babel\/runtime/),
    plugins: [
      // only use 'clear' on the first target
      del({
        targets: ["./dist", "./lib"],
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("development"),
        preventAssignment: true,
      }),
      nodeResolve(),
      commonjs(commonjsOptions),
      typescript({
        tsconfig: "./tsconfig.json",
        declarationDir: "./dist",
        jsx: "react-jsx",
        include: ["*.ts+(|x)", "**/*.ts+(|x)"],
        exclude: ["node_modules", "dist"],
      }),
      babel(babelOptions),
    ],
  },

  {
    input,
    output: {
      file: "./dist/react-big-calendar.min.js",
      format: "umd",
      name,
      globals,
      interop: "auto",
    },
    external: Object.keys(globals).push(/@babel\/runtime/),
    plugins: [
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
        preventAssignment: true,
      }),
      nodeResolve(),
      commonjs(commonjsOptions),
      typescript({
        tsconfig: "./tsconfig.json",
        declarationDir: "./dist",
        jsx: "react-jsx",
        include: ["*.ts+(|x)", "**/*.ts+(|x)"],
        exclude: ["node_modules", "dist"],
      }),
      babel(babelOptions),
      terser(),
    ],
  },

  {
    input,
    output: {
      file: pkg.module,
      format: "esm",
      interop: "auto",
    },
    // prevent bundling all dependencies
    external: (id) => !id.startsWith(".") && !id.startsWith("/"),
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        declarationDir: "./dist",
        jsx: "react-jsx",
        include: ["*.ts+(|x)", "**/*.ts+(|x)"],
        exclude: ["node_modules", "dist"],
      }),
      babel({
        ...babelOptions,
        configFile: path.join(__dirname, "babel.config.esm.js"),
      }),
    ],
  },
]
