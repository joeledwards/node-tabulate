const c = require('@buzuli/color')
const fs = require('fs')
const csv = require('csv-parser')
const Table = require('cli-table3')
const { Transform: CsvTransform } = require('json2csv')
const { checkFileFormat } = require('./util')

// Generate a table from a CSV file
async function tabulate ({
  file,
  fields,
  indices,
  fieldFilter,
  indexFilter,
  limit
}) {
  const format = await checkFileFormat({ file })

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
      throw new Error(`Unsupported file format: ${file}`)
    }
  })()

  let truncated = false
  let totalRecords = 0
  const records = []

  const recordFilter = (() => {
    if (fieldFilter != null) {
      //console.info(`Filtering field "${c.green(fieldFilter.colId)}" via regex ${c.yellow(fieldFilter.regex)}`)

      return record => {
        const value = record[fieldFilter.colId]
        return !!`${value}`.match(fieldFilter.regex)
      }
    } else if (indexFilter != null) {
      //console.info(`Filtering index ${c.orange(indexFilter.colId)} via regex ${c.yellow(indexFilter.regex)}`)

      return record => {
        const value = Object.values(record)[indexFilter.colId]
        return !!`${value}`.match(indexFilter.regex)
      }
    } else {
      return () => true
    }
  })()

  await new Promise((resolve, reject) => {
    transformStream
      .pipe(csv())
      .on('data', record => {
        totalRecords += 1

        if (!truncated) {
          if (recordFilter(record)) {
            if ((limit == null || limit > records.length)) {
              records.push(record)
            } else {
              truncated = true
            }
          }
        }
      })
      .once('error', error => {
        reject(error)
      })
      .once('end', () => {
        if (records.length < 1) {
          console.info(`No records output.`)
        } else {
          const headers = (() => {
            const allHeaders = Object.keys(records[0])

            if (fields) {
              return fields
            } else if (indices) {
              return indices.map(index => {
                const value = allHeaders[index]
                return value == null ? '' : value
              })
            } else {
              return allHeaders
            }
          })()

          const table = new Table({ head: headers })

          table.push(...(
            records.map(record => {
              if (fields) {
                return fields.map(field => {
                  const value = record[field]
                  return value == null ? '' : value
                })
              } else if (indices) {
                return indices.map(index => {
                  const value = Object.values(record)[index]
                  return value == null ? '' : value
                })
              } else {
                return Object.values(record)
              }
            })
          ))
          console.info(table.toString())

          if (truncated) {
            console.info(`Showing ${c.orange(records.length)} of ${c.orange(totalRecords)}`)
          }
        }

        resolve()
      })
  })
}

module.exports = {
  tabulate
}
