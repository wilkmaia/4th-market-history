import type {
  Node,
  Transaction as Neo4jTransaction,
} from 'neo4j-driver'

import * as db from './'
import { Transaction } from '../types'

export default class DTransaction {
  private _data: Transaction

  public node?: Node

  constructor(data: Transaction) {
    this._data = data
  }

  public async sync(trx: Neo4jTransaction): Promise<Node | null> {
    const query = `
      UNWIND $item.options as opt
      MATCH (i:Item {
        id: $item.id,
        name: $item.name,
        iconUrl: $item.iconUrl,
        refine: $item.refine,
        cards: $item.cards,
        bound: $item.bound,
        uniqueId: $item.uniqueId,
        enchantGrade: $item.enchantGrade
      })-[:HAS_OPTION]->(o)
      MERGE (t:Transaction {
        id: $id,
        time: $time,
        count: $count,
        unitPrice: $unitPrice
      })
      MERGE (t)-[:INCLUDES]->(i)
      RETURN t
    `

    try {
      const res = await trx.run(query, this._data)
      this.node = res.records[0].get('t')

      return this.node
    } catch (error: any) {
      console.error({
        message: 'Error saving transaction to database',
        errorMessage: error.message,
        error,
        transactionId: this._data.id,
      })

      return null
    }
  }
}
