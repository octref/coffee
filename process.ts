import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from 'fs'

interface Coffee {
  roaster: string
  coffee: string
  region: string
  process: string
  varietal: string
  roasted: string
  notes: string
}

const coffees: Coffee[] = JSON.parse(readFileSync('./coffee.json', 'utf8'))

const html = buidlHTML(coffees)
const sourceHTML = readFileSync('./index.template.html', 'utf8')
const newHTML = sourceHTML.replace('<!-- coffee -->', html)
ensureDirExists('./dist')
writeFileSync('./dist/index.html', newHTML)
copyFileSync('./style.css', './dist/style.css')

function buidlHTML(coffees: Coffee[]) {
  const thsHTML = `
    <tr class="entry">
      <th class="roaster-n-coffee">roaster<br />–<br />coffee</th>
      <th class="region-n-varietal">region<br />–<br />varietal</th>
      <th class="roasted">roast level<br />–<br />date</th>
      <th class="process">process</th>
      <th class="notes">notes</th>
    </tr>`

  const fields = [
    ['roaster', 'coffee'],
    ['region', 'varietal'],
    ['roasted'],
    ['process'],
    ['notes']
  ]

  const entryHTMLs = coffees.map((c) => {
    let html = '<tr class="entry">'

    fields.forEach((f) => {
      if (f.length === 1) {
        html += `<td class="${f[0]}">${c[f[0]]}</td>`
      } else {
        html += `<td class="${f.join('-n-')}">${f
          .map((p) => c[p])
          .join('<br />–<br />')}</td>`
      }
    })

    html += '</tr>'

    return html
  })

  return `<main><table id="coffees">${thsHTML}${entryHTMLs.join(
    ''
  )}</table></main>`
}

function ensureDirExists(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir)
  }
}
