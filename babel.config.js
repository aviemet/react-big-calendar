module.exports = function (api) {
  const isESMBuild = process.env.RBC_ESM_BUILD === 'true'
  const optionalPlugins = []

  if (isESMBuild) {
    optionalPlugins.push([
      'babel-plugin-transform-rename-import',
      {
        replacements: [{ original: 'lodash', replacement: 'lodash-es' }],
      },
    ])
  }

  const config = {
    presets: [
      [
        '@babel/preset-env',
        {
          ...(api.env('test') && {
            targets: {
              node: 'current',
            },
          }),
        },
      ],
      ['@babel/preset-react'],
    ],
    plugins: [
      ['@babel/plugin-transform-runtime'],
      ['transform-react-remove-prop-types', { mode: 'wrap' }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ...optionalPlugins,
    ],
  }

  return config
}
