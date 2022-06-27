#! /usr/bin/env node

const app = require('@buzuli/app')
const yargs = require('yargs')
const { tabulate } = require('../lib')
const { parseFilter, parseList, parseNumbers } = require('../lib/util')

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

