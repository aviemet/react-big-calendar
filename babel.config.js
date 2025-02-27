module.exports = function (api) {
  const isESMBuild = process.env.RBC_ESM_BUILD === 'true'
  const isTest = api.env('test')
  const optionalPlugins = []

  if(isESMBuild) {
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
          ...(isTest && {
            targets: {
              node: 'current',
            },
          }),
        },
      ],
      ['@babel/preset-react'],
      ['@babel/preset-typescript', { allowNamespaces: true }],
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
