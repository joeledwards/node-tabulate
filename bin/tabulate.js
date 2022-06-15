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
  await tabulate(args)
})

