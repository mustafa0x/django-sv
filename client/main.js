import './css/tailwind.css'
import './css/base.css'
import './util/preinit.js'
import './store.js'
import {mount} from 'svelte'
import App from './App.svelte'

mount(App, {target: document.body})

if (window.__DEBUG__ && location.hostname !== 'localhost') {
    onerror = (msg, url, ln, col, err) => {
        const loc = [(url || '').replace('https://', ''), ln || '', col || ''].join(':')
        alert([msg, loc, err ? err.stack : '<no stack>'])
    }
    onunhandledrejection = e => {
        if (!(e && e.reason && e.reason.stack) || e.reason.stack.includes('TypeError: Failed to fetch'))
            return
        alert(e.reason.stack)
    }
}
