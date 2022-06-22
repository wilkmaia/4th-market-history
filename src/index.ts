import { config as dotenvConfig } from 'dotenv'
import type {
  Session,
  Transaction as Neo4jTransaction,
} from 'neo4j-driver'

dotenvConfig()

import * as db from './database'
import Ragna4thDatabase from './lib/ragna4th-db'

const client = new Ragna4thDatabase({
  dataApiUrl: process.env.DATA_API_URL,
  transactionsApiUrl: process.env.TRANSACTIONS_API_URL,
})

const mainLoop = async (session: Session) => {
  while (true) {
    console.debug('Starting new batch')

    const transactions = await client.getLastTransactions()

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
    }

    if (transactions.length > 0) {
      const max = transactions[transactions.length - 1].id
      await client.setLastTransactionID(max)
      console.debug(`Updating lastKnownTransactionID: ${max}`)
    }

    console.debug('Processed last transactions. Waiting for 3000ms...')
    await new Promise(resolve => setTimeout(resolve, 3000))
  }
}

const run = async () => {
  const session = db.driver.session()

  await mainLoop(session)

  await session.close()
  await db.close()
}

run()
