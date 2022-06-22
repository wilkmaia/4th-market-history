import { config as dotenvConfig } from 'dotenv'
import type { Transaction as Neo4jTransaction } from 'neo4j-driver'

dotenvConfig()

import * as db from './database'
import Ragna4thDatabase from './lib/ragna4th-db'

const client = new Ragna4thDatabase({
  dataApiUrl: process.env.DATA_API_URL,
  transactionsApiUrl: process.env.TRANSACTIONS_API_URL,
})

const run = async () => {
  const transactions = await client.getLastTransactions()

  const session = db.driver.session()

  try {
    await session.writeTransaction((trx: Neo4jTransaction) =>
      Promise.all(transactions.map(async t => {
        const item = new db.DItem(t.item)
        await item.sync(trx)

        const transaction = new db.DTransaction(t)
        await transaction.sync(trx)
      }))
    )
  } catch (error: any) {
    console.error({
      message: 'Error on main loop',
      errorMessage: error.message,
      error,
    })
  } finally {
    await session.close()
    await db.close()
  }
}

run()
