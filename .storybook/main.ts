import { StorybookConfig } from "@storybook/react-webpack5"
import path from "path"
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin"
import webpack from "webpack"

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
    "@storybook/blocks",
    {
      name: "@storybook/addon-styling-webpack",
      options: {
        rules: [
          {
            test: /\.s[ac]ss$/i,
            use: [
              "style-loader",
              "css-loader",
              {
                loader: "sass-loader",
                options: { implementation: require.resolve("sass") },
              },
            ],
          },
          {
            test: /\.css$/,
            use: [
              "style-loader",
              "css-loader",
            ],
          },
        ],
      },
    },
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: true,
    defaultName: "Documentation",
  },
  webpackFinal: async(config) => {
    if(!config.module) config.module = { rules: [] }
    if(!config.resolve) config.resolve = { alias: {}, plugins: [] }
    if(!config.plugins) config.plugins = []

    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        extensions: config.resolve.extensions,
      }),
    ]

    config.plugins.push(
      new webpack.ProvidePlugin({
        React: "react",
      })
    )

    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
      "react-big-calendar": path.resolve(__dirname, "../src"),
      "globalize$": "globalize/dist/globalize",
      "cldr$": "cldrjs",
      "cldr": "cldrjs/dist/cldr",
    }

    return config
  },
}

export default config
