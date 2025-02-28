import type { StorybookConfig } from '@storybook/react-webpack5'
import path from 'path'

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
    // "@storybook/addon-styling-webpack",
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        rules: [
          // Replaces any existing Sass rules with given rules
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
        ],
      },
    },
    // {
    //   name: '@storybook/addon-styling-webpack',
    //   options: {
    //     rules: [
    //       // Replaces existing CSS rules to support PostCSS
    //       {
    //         test: /\.css$/,
    //         use: [
    //           'style-loader',
    //           {
    //             loader: 'css-loader',
    //             options: { importLoaders: 1 },
    //           },
    //           {
    //             // Gets options from `postcss.config.js` in your project root
    //             loader: 'postcss-loader',
    //             options: { implementation: require.resolve('postcss') },
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: true,
    defaultName: 'Documentation',
  },
  webpackFinal: async (config) => {
    if(!config.module) config.module = { rules: [] }
    if(!config.resolve) config.resolve = { alias: {} }

    // Add path aliases
    if(config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
        'react-big-calendar': path.resolve(__dirname, '../src'),
      }
    }

    // Add SASS support
    // if(config.module?.rules) {
    //   config.module.rules.push({
    //     test: /\.scss$/,
    //     use: [
    //       'style-loader',
    //       {
    //         loader: 'css-loader',
    //         options: {
    //           modules: {
    //             auto: true,
    //             localIdentName: '[name]__[local]--[hash:base64:5]',
    //           },
    //         },
    //       },
    //       'sass-loader',
    //     ],
    //     include: path.resolve(__dirname, '../'),
    //   })
    // }
    return config
  },
}

export default config
