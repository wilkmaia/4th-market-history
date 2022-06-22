import type {
  Node,
  Transaction as Neo4jTransaction,
} from 'neo4j-driver'

import * as db from './'
import { Item } from '../types'

export default class DItem {
  private _data: Item

  public node?: Node

  constructor(data: Item) {
    this._data = data
  }

  public async sync(trx: Neo4jTransaction): Promise<Node | null> {
    const query = `
      UNWIND $options as opt
      MERGE (o:ItemOption {
        id: opt.id,
        val: opt.val,
        parm: opt.parm
      })
      MERGE (i:Item {
        id: $id,
        name: $name,
        iconUrl: $iconUrl,
        refine: $refine,
        cards: $cards,
        bound: $bound,
        uniqueId: $uniqueId,
        enchantGrade: $enchantGrade
      })
      MERGE (i)-[:HAS_OPTION]->(o)
      RETURN i
    `

    try {
      const res = await trx.run(query, this._data)
      this.node = res.records[0].get('i')

      return this.node
    } catch (error: any) {
      console.error({
        message: 'Error saving item to database',
        errorMessage: error.message,
        error,
        itemId: this._data.id,
      })

      return null
    }
  }
}
