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
import { prettifyCoffeeJSON } from './prettify'

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
  const jsSource = readFileSync(resolveRootPath('./src/index.js'))

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

  let thsHTML = `<tr class="entry">`
  fields.forEach((f, fi) => {
    thsHTML += `<th class="${f.join('-n-')}">${f.join(
      `<br />${DIVIDER_HTML}<br />`
    )}</th>`

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
          let propHTML = c[p]
          if (!c[p]) {
            propHTML = UNKNOWN_PROP_HTML
          } else if (p === 'roaster' && c.roaster_link) {
            propHTML = `<a href="${c.roaster_link}" target="_blank">${propHTML}</a>`
          } else if (p === 'coffee' && c.coffee_link) {
            propHTML = `<a href="${c.coffee_link}" target="_blank">${propHTML}</a>`
          }

          return propHTML
        })
        .join(`<br />${DIVIDER_HTML}<br />`)}</td>`

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
