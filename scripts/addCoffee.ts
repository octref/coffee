/**
 * This script is invoked through GitHub Action to add a new coffee
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const COFFEE_PATH = resolve(__dirname, '../data/coffee.json')

if (process.argv.length > 2) {
  const payload = JSON.parse(process.argv[2])

  const file: any[] = JSON.parse(readFileSync(COFFEE_PATH, 'utf8'))
  file.unshift(payload)

  writeFileSync(COFFEE_PATH, JSON.stringify(file, null, 2))
}
