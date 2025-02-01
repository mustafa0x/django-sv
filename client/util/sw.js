const fetch_nocache = url => fetch(`${url}${url.includes('?') ? '&' : '?'}__nc=${Date.now()}`)
async function fetch_and_cache(request, cache_name) {
    const response = await fetch(request)
    if (!response || response.status !== 200 || response.type !== 'basic')
        return response

    ;(await caches.open(cache_name)).put(request, response.clone())
    return response
}

/**
 * @typedef {{[key: string]: string | string[] | {url?: string, matcher: RegExp}}} Manifest
 * - if string or array, assets will be cached and matched
 * - if object with `url` and `matcher`, the url will be cached and requests
 *   that match `matcher` will be served from the cache
 * - if object with only `matcher`, it will be cached on demand
 */
const MANIFEST = {
    app_v$TS$: '/',
    media: [
        '/manifest.json',
        '/favicon.ico',
        '/app.png',
        '$POLYFILLS$',
        '$SENTRY$',
        'https://fonts.nuqayah.com/kitab-base.woff2?v4',
        'https://fonts.nuqayah.com/kitab-base-bold.woff2?v4',
        'https://fonts.nuqayah.com/kitab-phrases.woff2?v4',
        'https://nuqayah.com/assets/nuqayah.svg',
        'https://nuqayah.com/assets/ayatt-logo-full.svg',
    ],
}

addEventListener('install', e => {
    skipWaiting()
    e.waitUntil((async () => {
        await Promise.all((await caches.keys()).filter(k => !(k in MANIFEST)).map(k => caches.delete(k)))

        for (const [k, v] of Object.entries(MANIFEST)) {
            if (Array.isArray(v))
                (await caches.open(k)).addAll(v)
            else if (v.url)
                (await caches.open(k)).put(v.url, await fetch_nocache(v.url))
            else if (typeof v === 'string')
                (await caches.open(k)).put(v, await fetch_nocache(v))
        }
    })())
})
addEventListener('fetch', e => {
    let url = e.request.url.replace(location.origin, '')
    let matched = false
    for (const [k, v] of Object.entries(MANIFEST)) {
        matched = Array.isArray(v) ? v.includes(url) :
                  v.matcher ? v.matcher.test(url) :
                  v === url
        if (matched) {
            if (v.url)
                url = v.url
            e.respondWith(caches.match(url).then(r => r || fetch_and_cache(url, k)))
            return
        }
    }
})
