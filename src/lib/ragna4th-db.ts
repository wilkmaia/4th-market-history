import fetch from 'node-fetch'

import { DEFAULT_TIMEOUT_MS } from './constants'
import {
  Transaction,
  ApiResponseItem,
  Ragna4thDatabaseProps,
} from '../types'

export default class Ragna4thDatabase {
  private _dataApiUrl: string
  private _transactionsApiUrl: string

  private _timeout: number
  private _lastKnownTransactionID: number

  constructor(opts: Ragna4thDatabaseProps) {
    this._dataApiUrl = opts.dataApiUrl
    this._transactionsApiUrl = opts.transactionsApiUrl

    this._timeout = opts.timeoutMs ?? Number.parseInt(process.env.DEFAULT_TIMEOUT_MS, 10) ?? DEFAULT_TIMEOUT_MS
    this._lastKnownTransactionID = 0
  }

  private async _getItemName(itemId: number): Promise<string> {
    try {
      const res = await fetch(`${this._dataApiUrl}/db/i/in/${itemId}`)
      return res.text()
    } catch (error: any) {
      console.error({
        message: 'Error fetching item name',
        itemId,
        errorMessage: error.message,
        error,
      })

      return ''
    }
  }

  private _getIconUrl(itemId: number): string {
    return `${this._dataApiUrl}/db/i/ic/${itemId}`
  }

  private _apiResponse2Transactions(items: ApiResponseItem[]): Promise<Transaction[]> {
    return Promise.all(items.map(async item => ({
      id: item.id,
      item: {
        id: item.nameid,
        name: await this._getItemName(item.nameid),
        iconUrl: this._getIconUrl(item.nameid),
        time: new Date(item.time),
        amount: item.amount,
        price: item.price,
        refine: item.refine,
        cards: [item.card0, item.card1, item.card2, item.card3],
        options: [
          { id: item.option_id0, val: item.option_val0, parm: item.option_parm0 },
          { id: item.option_id1, val: item.option_val1, parm: item.option_parm1 },
          { id: item.option_id2, val: item.option_val2, parm: item.option_parm2 },
          { id: item.option_id3, val: item.option_val3, parm: item.option_parm3 },
        ],
        bound: item.bound,
        uniqueId: item.unique_id,
        enchantGrade: item.enchantgrade,
      },
    })))
  }

  public async getLastTransactions(): Promise<Transaction[]> {
    try {
      const res = await fetch(`${this._transactionsApiUrl}/discord/transactions/last`)
      const { items } = await res.json() as { items: ApiResponseItem[] }
      const newTransactions = items.filter((i: ApiResponseItem) => i.id > this._lastKnownTransactionID)

      if (newTransactions.length === 0) {
        return []
      }

      if (this._lastKnownTransactionID > 0 && newTransactions.length === items.length) {
        console.warn({
          level: 'WARN',
          lastKnownTransactionID: this._lastKnownTransactionID,
          oldestTransactionReturned: items[items.length - 1].id,
          message: 'Some transactions were possibly lost',
        })
      }

      this._lastKnownTransactionID = items[0].id
      return this._apiResponse2Transactions(newTransactions)
    } catch (error: any) {
      console.error({
        message: 'Error fetching last transactions',
        errorMessage: error.message,
        error,
      })

      return []
    }
  }
}
