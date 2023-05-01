import { CracoConfig } from '@craco/types'
import CompressionPlugin, {
  WebpackPluginInstance,
} from 'compression-webpack-plugin'
import path from 'path'
import { optimize } from 'webpack'

const isProd = process.env.NODE_ENV === 'production'

const devPlugins: WebpackPluginInstance[] = []

const prodPlugins: WebpackPluginInstance[] = [
  new CompressionPlugin({
    algorithm: 'gzip',
    test: /\.(js|css|html|svg)$/,
    threshold: 10240,
  }),
  new CompressionPlugin({
    algorithm: 'brotliCompress',
    test: /\.(js|css|svg)$/,
    threshold: 10240,
  }),
  // We always want to compress the html file
  new CompressionPlugin({
    algorithm: 'brotliCompress',
    test: /\.html$/,
    threshold: 0,
  }),
  new optimize.LimitChunkCountPlugin({
    maxChunks: 15,
  }),
]

const pluginList = isProd ? [...devPlugins, ...prodPlugins] : devPlugins

const cracoConfig: CracoConfig = {
  paths: (config) => {
    if (config) {
      config.appBuild = path.resolve('./render-server/build')
    }
    return config
  },
  webpack: {
    plugins: { add: pluginList },
    configure: (webpackConfig, { env }) => {
      const isDev = env === 'development'
      webpackConfig = {
        ...webpackConfig,
        optimization: {
          ...webpackConfig.optimization,
          minimize: !isDev, // Important: disable minimize in development (Takes too long)
        },
        output: {
          ...webpackConfig.output,
          filename: isDev ? '[name].js' : '[name].[chunkhash].js',
          chunkFilename: isDev
            ? '[name].chunk.js'
            : '[name].[chunkhash].chunk.js',
          path: path.resolve('./render-server/build'),
          publicPath: '/',
        },
      }

      return webpackConfig // Important: return the modified config
    },
  },
}

export default cracoConfig
