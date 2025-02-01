import {writeFileSync as write, readFileSync} from 'fs'
import {minify} from 'terser'
import {apply_repls} from 'components/src/util.js'
import {execSync as exec} from 'child_process'
import pkg from './package.json' with {type: 'json'}

const r = p => readFileSync(p, 'utf8')
const min_js = (s, conf) => minify(s, {module: true, mangle: {module: true}, compress: {module: true, unsafe: false, global_defs: {'window.__DEBUG__': false}}, format: {comments: false}, ...conf})

// Polyfills
const pf_url_base = 'https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?version=4.8.0&features='
const pf_features = [
    ['Object.fromEntries'],
    ['Array.prototype.flat'],
    ['Array.prototype.at'],
    ['String.prototype.at'],
    ['String.prototype.replaceAll'],
    ['globalThis', 'window.globalThis'],
    ['Intl.RelativeTimeFormat.~locale.ar', 'Intl.RelativeTimeFormat'],
]
const pf_url = pf_url_base + pf_features.map(pf => pf[0]).join(',')
const pf_script = `((${pf_features.map(pf => pf[1] || pf[0]).join(' && ')}) || document.write('<script src="${pf_url}"><\\/script>'))`

// Sentry
const sentry_url = `https://sentry.nuqayah.com/js-sdk-loader/${pkg.config.sentry_dsn}.min.js`
const sentry = apply_repls(await (await fetch(sentry_url)).text(), [
    ['bundle.min.js', 'bundle.replay.min.js'],
    ['.replayIntegration()', '.replayIntegration({maskAllInputs: false, maskAllText: false})'],
    [/{(?="dsn":)/, `{"release": "${pkg.version}",`],
    [/("tracesSampleRate"):1/, '$1:0'],
]).trim()

// Service worker
write('dist/sw.js', (await min_js(apply_repls(r('client/util/sw.js'), [
    ['$TS$', Date.now()],
    ['$POLYFILLS$', pf_url],
    ['$SENTRY$', sentry.match(/https:\/\/browser.sentry-cdn.com.*?\.js/)[0]],
]))).code)

// Minify
const {code, map} = await min_js({'bundle.es.js': r('dist/bundle.es.js')}, {sourceMap: {content: r('dist/bundle.es.js.map')}})

// Write bundle and sourcemap
write('dist/bundle-final.js', code + '\n//# sourceMappingURL=bundle-final.js.map')
write('dist/bundle-final.js.map', map)

// Upload to sentry
exec(`sentry-cli sourcemaps inject -o sentry -p ${pkg.name} -r ${pkg.version} ./dist/bundle-final.js*`, {stdio: 'inherit'})
exec(`sentry-cli sourcemaps upload -o sentry -p ${pkg.name} -r ${pkg.version} ./dist/bundle-final.js*`, {stdio: 'inherit'})

const scripts = [
    `<script>${sentry};${pf_script}</script>`,
    `<script type=module>${r('dist/bundle-final.js').replace(/\/\/# sourceMappingURL=.*/, '').trim()}</script>`,
    `<script defer data-domain="${pkg.config.domain}" src="https://a9s.nuqayah.com/js/script.js"></script>`,
]

// Combine
const pg = apply_repls(r('index.html'), [
    [/\n+ */g, ''], // important for sentry
    [/(?<=<\/title>)/, () => `<style>${r(`dist/${pkg.name}.css`)}</style>`],
    [/<script src.+<\/script>/, () => scripts.join('')],
])
const icon_repls = [[/ xmlns=".*?"/, ''], ['id="', 'id="icon-'], [/\n */g, ''], [/(\d")\//g, '$1 /'], [/="([^, ]+)"/g, '=$1']]
write('dist/index.html', pg + apply_repls(r('public/icons.svg'), icon_repls))
