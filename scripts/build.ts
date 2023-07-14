import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'fs'
import { resolve } from 'path'
import { minify } from 'html-minifier-terser'
import { Coffee } from './types'

build()
  .then(() => {
    console.log('all done')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

async function build() {
  const coffees: Coffee[] = JSON.parse(
    readFileSync(resolveRootPath('./data/coffee.json'), 'utf-8')
  )

  const templateHTML = readFileSync(
    resolveRootPath('./src/index.template.html'),
    'utf-8'
  )
  const coffeeHTML = buildCoffeeHTML(coffees)
  const cssSource = readFileSync(resolveRootPath('./src/style.css'), 'utf-8')
  const jsSource = readFileSync(resolveRootPath('./src/index.js'), 'utf-8')

  const newHTML = templateHTML
    .replace('<!-- coffee -->', coffeeHTML)
    .replace(
      '<link rel="stylesheet" href="./style.css" />',
      `<style>${cssSource}</style>`
    )
    .replace(
      '<script defer src="./index.js"></script>',
      `<script defer>${jsSource}</script>`
    )

  const minifiedHTML = await minify(newHTML, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
  })

  ensureDirExists(resolveRootPath('./dist'))
  writeFileSync(resolveRootPath('./dist/index.html'), minifiedHTML)

  readdirSync(resolveRootPath('./static')).forEach((f) => {
    copyFileSync(
      resolveRootPath(`./static/${f}`),
      resolveRootPath(`./dist/${f}`)
    )
  })
}

function buildCoffeeHTML(coffees: Coffee[]) {
  const fields = [
    ['roaster', 'coffee'],
    ['region', 'altitude', 'varietal'],
    ['roast', 'roasted'],
    ['process'],
    ['notes']
  ]

  const DIVIDER_HTML = '<span class="divider">-</span>'
  const UNKNOWN_PROP_HTML = '<span class="unknown">/</span>'
  const LINK_EXTERNAL_SVG = `<span class="link"><svg
  fill="none"
  height="24"
  shape-rendering="geometricPrecision"
  stroke="currentColor"
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="1.5"
  viewBox="0 0 24 24"
  width="24"
  style="color: currentcolor; width: 14px; height: 14px"
>
  <path d="M7 17L17 7"></path>
  <path d="M7 7h10v10"></path>
</svg></span>`

  let thsHTML = `<tr class="entry">`
  fields.forEach((f, fi) => {
    thsHTML += `<th class="${f.join('-n-')}">${f.join(DIVIDER_HTML)}</th>`

    if ((fi + 1) % 3 === 0) {
      thsHTML += `<th class="flex-divider"></th>`
    }
  })
  thsHTML += `</tr>`

  const entryHTMLs = coffees.map((c) => {
    let html = '<tr class="entry">'

    fields.forEach((f, fi) => {
      html += `<td class="${f.join('-n-')}">${f
        .map((p) => {
          let propHTML = `<span>${c[p]}</span>`
          if (!c[p]) {
            propHTML = UNKNOWN_PROP_HTML
          } else if (p === 'roaster' && c.roaster_link) {
            propHTML = `<a href="${c.roaster_link}" target="_blank">${propHTML}${LINK_EXTERNAL_SVG}</a>`
          } else if (p === 'coffee' && c.coffee_link) {
            propHTML = `<a href="${c.coffee_link}" target="_blank">${propHTML}${LINK_EXTERNAL_SVG}</a>`
          }

          return propHTML
        })
        .join(DIVIDER_HTML)}</td>`

      if ((fi + 1) % 3 === 0) {
        html += `<td class="flex-divider"></td>`
      }
    })

    html += '</tr>'

    return html
  })

  return `<main><table id="coffees">${thsHTML}${entryHTMLs.join(
    ''
  )}</table></main>`
}

// resolve a path like `./src/index.js` relative to root
function resolveRootPath(p: string) {
  return resolve(__dirname, '../', p)
}

function ensureDirExists(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir)
  }
}
