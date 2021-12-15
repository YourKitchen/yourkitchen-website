const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const BrotliPlugin = require('brotli-webpack-plugin')

module.exports = {
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
  plugins: [
    new BrotliPlugin({
      asset: '[path].br[query]',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
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
  ],
  optimization: {
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
  },
}
