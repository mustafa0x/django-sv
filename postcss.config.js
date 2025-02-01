const prod = process.env.NODE_ENV === 'production'
export default {
    plugins: {
        tailwindcss: {},
        'tailwindcss/nesting': 'postcss-nesting',
        '@csstools/postcss-is-pseudo-class': prod && {},
        autoprefixer: prod && {},
        cssnano: prod && {
            preset: ['default', {normalizeUrl: false, discardComments: {removeAll: true}}],
        },
    }
}
