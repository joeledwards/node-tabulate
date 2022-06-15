#! /usr/bin/env node

const app = require('@buzuli/app')
const yargs = require('yargs')
const { tabulate } = require('../lib')

app({
  modules: {
    args: () => {
      return yargs.command(
        '$0 <file>',
        'convert a file into a table in the terminal',
        yarg => {
          yarg
            .option('fields', {
              coerce: parseList,
              desc: 'maximum number of rows to output',
              alias: 'f',
            })
            .option('indices', {
              coerce: parseNumbers,
              desc: 'maximum number of rows to output',
              alias: 'i',
              conflicts: ['fields'],
            })
            .option('limit', {
              type: 'number',
              desc: 'maximum number of rows to output',
              default: 1000,
              alias: 'l',
            })
        }
      ).parse()
    }
  }
})(async ({
  modules: { args }
}) => {
  try {
    await tabulate(args)
  } catch (error) {
    console.error(`${error}`)
    process.exit(1)
  }
})

// Parse a list of strings
function parseList (list) {
  if (typeof list != 'string' && typeof list != 'number') {
    throw new Error('An argument is required')
  }

  const parts = list.toString().split(',').map(str => {
    if (str.trim() === '') {
      throw new Error('List values may not be empty')
    }

    return str
  })

  if (parts.length < 1) {
    throw new Error('At least 1 value required in list')
  }

  return parts
}

// Parse a list of numbers
function parseNumbers (list) {
  let hasNan = false
  const numbers = parseList(list).map(str => {
    const num = Number(str)

    if (isNaN(num)) {
      throw new Error('All values must be numbers')
    }

    return num
  })

  return numbers
}
