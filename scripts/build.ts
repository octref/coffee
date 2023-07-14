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

interface Coffee {
  roaster: string
  coffee: string
  region: string
  altitude: string
  varietal: string
  roast: string
  roasted: string
  process: string
  notes: string
}

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
  sortCoffeeByDate(coffees)

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
  fields.forEach((f) => {
    if (f.length === 1) {
      thsHTML += `<th class="${f[0]}">${f[0]}</th>`
    } else {
      thsHTML += `<th class="${f.join('-n-')}">${f.join(
        `<br />${DIVIDER_HTML}<br />`
      )}</th>`
    }
  })
  thsHTML += `</tr>`

  const entryHTMLs = coffees.map((c) => {
    let html = '<tr class="entry">'

    fields.forEach((f) => {
      if (f.length === 1) {
        html += `<td class="${f[0]}">${c[f[0]] || UNKNOWN_PROP_HTML}</td>`
      } else {
        html += `<td class="${f.join('-n-')}">${f
          .map((p) => c[p] || UNKNOWN_PROP_HTML)
          .join(`<br />${DIVIDER_HTML}<br />`)}</td>`
      }
    })

    html += '</tr>'

    return html
  })

  return `<main><table id="coffees">${thsHTML}${entryHTMLs.join(
    ''
  )}</table></main>`

  function sortCoffeeByDate(coffees: Coffee[]) {
    return coffees.sort((c1, c2) => {
      const d1 = new Date(c1.roasted)
      const d2 = new Date(c2.roasted)

      if (d1 > d2) {
        return -1
      } else if (d1 < d2) {
        return 1
      } else {
        if (c1.coffee > c2.coffee) {
          return -1
        } else if (c1.coffee < c2.coffee) {
          return 1
        } else {
          return 0
        }
      }
    })
  }
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
