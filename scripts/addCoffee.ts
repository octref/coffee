/**
 * This script is invoked through GitHub Action to add a new coffee
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { Coffee } from './types'
import { prettifyCoffeeJSON } from './prettify'

const COFFEE_PATH = resolve(__dirname, '../data/coffee.json')

if (process.argv.length > 2) {
  const payload: { coffee: Coffee } = JSON.parse(process.argv[2])
  const { coffee } = payload

  const coffees: Coffee[] = JSON.parse(readFileSync(COFFEE_PATH, 'utf8'))
  coffees.unshift(coffee)

  writeFileSync(COFFEE_PATH, prettifyCoffeeJSON(coffees))
}
