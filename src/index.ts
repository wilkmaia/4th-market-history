import { config as dotenvConfig } from 'dotenv'

dotenvConfig()

import Ragna4thDatabase from './lib/ragna4th-db'

const client = new Ragna4thDatabase({
  dataApiUrl: process.env.DATA_API_URL,
  transactionsApiUrl: process.env.TRANSACTIONS_API_URL,
})

const run = async () => {
  const data = await client.getLastTransactions()
  console.log(data)
}

run()
