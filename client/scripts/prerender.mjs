/**
 * Build step: renders the app to static HTML and injects it into
 * dist/index.html, so crawlers and link-preview bots that don't run
 * JavaScript still see the full page. React then hydrates it in the browser.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server entry).
 */
import { readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const indexPath = path.join(root, 'dist/index.html')
const ssrDir = path.join(root, 'dist-ssr')

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
const template = await readFile(indexPath, 'utf8')

if (!template.includes('<!--app-html-->')) {
  throw new Error('dist/index.html is missing the <!--app-html--> placeholder')
}

const appHtml = render()
await writeFile(indexPath, template.replace('<!--app-html-->', appHtml))
await rm(ssrDir, { recursive: true, force: true })

console.log(`prerender: injected ${(appHtml.length / 1024).toFixed(1)} KB of HTML into dist/index.html`)
