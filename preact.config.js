import path from 'path'
import crypto from 'crypto'

/**
 * md4 algorithm is not available anymore in NodeJS 17+ (because of lib SSL 3).
 * In that case, silently replace md4 by md5 algorithm.
 */
try {
  crypto.createHash('md4')
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Crypto "md4" is not supported anymore by this Node version')
  const origCreateHash = crypto.createHash
  crypto.createHash = (alg, opts) =>
    origCreateHash(alg === 'md4' ? 'md5' : alg, opts)
}

export default {
  webpack(config, env, helpers) {
    config.resolve.modules.push(env.src)
    const publicPath = process.env.GITHUB_PAGES
      ? `/${process.env.GITHUB_PAGES}/`
      : '/'
    const ghEnv =
      process.env.GITHUB_PAGES && JSON.stringify(`${process.env.GITHUB_PAGES}`)

    config.output.publicPath = publicPath
    const { plugin } = helpers.getPluginsByName(config, 'DefinePlugin')[0]
    Object.assign(plugin.definitions, { 'process.env.GITHUB_PAGES': ghEnv })

    config.module.rules[4].include = [
      path.resolve(__dirname, 'src', 'routes'),
      path.resolve(__dirname, 'src', 'components'),
      path.resolve(__dirname, 'src', 'solutions')
    ]

    config.module.rules[5].exclude = [
      path.resolve(__dirname, 'src', 'routes'),
      path.resolve(__dirname, 'src', 'components'),
      path.resolve(__dirname, 'src', 'solutions')
    ]
  }
}
