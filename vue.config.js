const configureAPI = require('./configure')
const mock = require('./mock')
const before = process.env.NODE_ENV === 'front_only' ? mock : configureAPI

process.env.VUE_APP_BENEFIT_COUNT = 112

module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  chainWebpack(config) {
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => ({
        ...options,
        compilerOptions: {
          ...options.compilerOptions,
          preserveWhitespace: true,
        },
      }));
  },
  devServer: {
    writeToDisk: true,
    before: before
  }
}
