const c = require('@buzuli/color')
const fs = require('fs')
const csv = require('csv-parser')
const Table = require('cli-table3')

async function tabulate ({ file, limit }) {
  const stream = fs.createReadStream(file)

  let truncated = false
  let totalRecords = 0
  const records = []

  await new Promise((resolve, reject) => {
    stream
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

module.exports = {
  tabulate
}
