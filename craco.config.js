const path = require('path')
const { getLoader, loaderByName } = require('@craco/craco')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const BrotliPlugin = require('brotli-webpack-plugin')
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const packages = []
packages.push(path.join(__dirname, '../yourkitchen-models'))
packages.push(path.join(__dirname, '../yourkitchen-common'))

const isProd =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'PROD'

const devPlugins = [new BundleAnalyzerPlugin()]

const prodPlugins = [
  new webpack.DefinePlugin({
    PRODUCTION: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  new webpack.ProgressPlugin(),
  new UglifyJsPlugin({
    cache: true,
    parallel: true,
    sourceMap: true,
  }),
  new BrotliPlugin({
    asset: '[path].br[query]',
    test: /\.(js|css|html|svg)$/,
    threshold: 10240,
    minRatio: 0.8,
  }),
]

const pluginList = isProd ? [...devPlugins, ...prodPlugins] : devPlugins

module.exports = {
  webpack: {
    presets: ['@babel/preset-env'],
    exclude: /(node_modules)/,
    rules: [
      {
        test: /.(js|jsx)?$/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /.(ts|tsx)?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-typescript'],
          },
        },
      },
    ],
    plugins: pluginList,
    optimization: isProd
      ? {
          splitChunks: {
            cacheGroups: {
              commons: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
              },
            },
          },
          runtimeChunk: {
            name: 'manifest',
          },
        }
      : undefined,
    configure: (webpackConfig, arg) => {
      const { isFound, match } = getLoader(
        webpackConfig,
        loaderByName('babel-loader'),
      )
      if (isFound) {
        const include = Array.isArray(match.loader.include)
          ? match.loader.include
          : [match.loader.include]

        match.loader.include = include.concat(packages)
      }
      return webpackConfig
    },
  },
}
