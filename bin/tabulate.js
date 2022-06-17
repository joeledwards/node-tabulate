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
              desc: 'the sequence of columns to included based on name',
              alias: 'f',
            })
            .option('indices', {
              coerce: parseNumbers,
              desc: 'the sequence of columns to include based on index (zero-based)',
              alias: 'i',
              conflicts: ['fields'],
            })
            .option('field-filter', {
              coerce: parseFilter(false),
              desc: 'filter based on the values in a column identified by its name and a regex; form is <column-name>:<regex>',
              alias: ['ff', 'F'],
            })
            .option('index-filter', {
              coerce: parseFilter(true),
              desc: 'filter based on the values in a column identified by its index (zero-based) and a regex; form is <column-index>:<regex>',
              alias: ['if', 'I'],
              conflicts: ['field-filter'],
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

// Parse a filter
function parseFilter (isIndexFilter) {
  return text => {
    if (typeof text != 'string') {
      throw new Error('An argument is required')
    }

    const pivot = text.indexOf(':')

    if (pivot < 1 || (pivot + 1) >= text.length) {
      throw new Error('Filter format is invalid')
    }

    const colId = (() => {
      const id = text.substr(0, pivot)

      if (isIndexFilter) {
        const index = Number(id)

        if (isNaN(index)) {
          throw new Error('Non-integer value supplied for index')
        }

        return index
      } else {
        return id
      }
    })()

    const regex = (() => {
      try {
        const regexStr = text.substr(pivot + 1, text.length)
        return new RegExp(regexStr)
      } catch (error) {
        throw new Error('Invalid filter regex')
      }
    })()

    return {
      colId,
      regex,
    }
  }
}
