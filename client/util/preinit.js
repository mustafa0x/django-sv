import {get_vh_offset, add_tab_check, init_useragent_info} from 'components/src/util.js'
window.BASE_TITLE = document.title

if (window.__DEBUG__)
    window.Sentry = {captureMessage: console.log, captureException: console.error}
else {
    // Check localStorage + indexedDB
    try {
        localStorage.setItem('_TEST_KEY_', 1)
        localStorage.removeItem('_TEST_KEY_')
    } catch (e) {
        delete window['localStorage']
        window.localStorage = {setItem: () => {}, getItem: () => {}, removeItem: () => {}}
    }
    indexedDB.open('_TEST_DB_', 1).onerror = () => {
        alert('لم نتمكن من فتح قاعدة البيانات! عذرا، لن يعمل التطبيق.')
        Sentry.captureMessage('Failed to open DB')
    }

    if (!location.host.includes(''))
        alert('ERROR')

    function remove_search_param(url_str, param) {
        const url_object = new URL(url_str)
        url_object.searchParams.delete(param)
        return url_object.toString()
    }
    if (location.search.includes('fbclid='))
        location.replace(remove_search_param(location.href, 'fbclid'))

    // ServiceWorker
    if (navigator.serviceWorker) {
        if (!navigator.serviceWorker.controller)
            navigator.serviceWorker.register('/sw.js')
        else {
            let refreshing
            // Reload page if a new service worker took over
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    location.reload()
                    refreshing = true
                }
            })
        }
    }
}

init_useragent_info()
add_tab_check()

/* On mobile: 100vh != 100% */
window._VH_OFFSET = 0
setTimeout(() => { window._VH_OFFSET = get_vh_offset() }, 100 + (window._useragent.ios ? 500 : 10))
if (!document.startViewTransition) document.startViewTransition = cb => cb()
