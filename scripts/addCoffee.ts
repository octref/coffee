/**
 * This script is invoked through GitHub Action to add a new coffee
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { Coffee } from './types'
import { prettifyCoffeeJSON } from './prettify'

const COFFEE_PATH = resolve(__dirname, '../data/coffee.json')

if (process.argv.length > 2) {
  const payload: Coffee = JSON.parse(process.argv[2])

  const coffees: Coffee[] = JSON.parse(readFileSync(COFFEE_PATH, 'utf8'))
  coffees.unshift(payload)

  writeFileSync(COFFEE_PATH, prettifyCoffeeJSON(coffees))
}
