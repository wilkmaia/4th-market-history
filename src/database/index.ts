import neo4j from 'neo4j-driver'
import type { Driver } from 'neo4j-driver'

const uri = process.env.NEO4J_URI
const username = process.env.NEO4J_USERNAME
const password = process.env.NEO4J_PASSWORD

export const driver = neo4j.driver(uri, neo4j.auth.basic(username, password))

export const close = async () => {
  await driver.close()
}

export { default as DItem} from './item'
export { default as DTransaction } from './transaction'
