export default {
  // 使用@babel/runtime来提供helper函数
  babelHelpers:'runtime',
  extensions: ['.ts', '.tsx'],
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-transform-runtime']
  ]
};
