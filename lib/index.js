const c = require('@buzuli/color')
const fs = require('fs')
const csv = require('csv-parser')
const Table = require('cli-table3')
const { Transform: CsvTransform } = require('json2csv')

// Generate a table from a CSV file
async function tabulate ({ file, limit }) {
  const format = await checkFormat({ file })

  console.info(`Source file: ${file}`)
  console.info(`Source format: ${format}`)
  const fileStream = fs.createReadStream(file)

  const transformStream = (() => {
    if (format === 'csv') {
      return fileStream
    } else if (format === 'json') {
      const transformer = new CsvTransform()
      return fileStream.pipe(transformer)
    } else if (format === 'ndjson') {
      const transformer = new CsvTransform({ ndjson: true })
      return fileStream.pipe(transformer)
    } else {
      throw new Error(`Invalid format "${format}"`)
    }
  })()

  let truncated = false
  let totalRecords = 0
  const records = []

  await new Promise((resolve, reject) => {
    transformStream
      .pipe(csv())
      .on('data', record => {
        totalRecords += 1

        if (!truncated) {
          if (limit == null || limit > records.length) {
            records.push(record)
          } else {
            truncated = true
          }
        }
      })
      .once('error', error => {
        reject(error)
      })
      .once('end', () => {
        const table = new Table({ head: Object.keys(records[0]) })

        table.push(...(records.map(record => Object.values(record))))
        console.info(table.toString())

        if (truncated) {
          console.info(`Showing ${c.orange(records.length)} of ${c.orange(totalRecords)}`)
        }

        resolve()
      })
  })
}

// Determine the format
async function checkFormat ({ file }) {
  // TODO: sample the file rather than just inspecting the extension

  if (file.endsWith('.csv')) {
    return 'csv'
  } else if (file.endsWith('.json')) {
    return 'json'
  } else if (
    file.endsWith('.jsonl') ||
    file.endsWith('.nljson') ||
    file.endsWith('.ndjson')
  ) {
    return 'ndjson'
  } else {
    return 'unknown'
  }
}

module.exports = {
  checkFormat,
  tabulate
}
