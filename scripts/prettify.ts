import { Coffee } from './types'

export function prettifyCoffeeJSON(coffees: Coffee[]) {
  const sortedCoffees = sortCoffeeByDate(coffees)

  // order object keys
  let outJSON = `[`
  outJSON += sortedCoffees
    .map((coffee) => {
      return JSON.stringify(coffee, Object.keys(coffee).sort())
    })
    .join(',\n')
  outJSON += ']'

  return JSON.stringify(JSON.parse(outJSON), null, 2)
}

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
