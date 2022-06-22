export type Ragna4thDatabaseProps = {
  dataApiUrl: string
  transactionsApiUrl: string
  timeoutMs?: number
}

export type ApiResponseItem = {
  id: number
  time: Date
  nameid: number
  amount: number
  price: number
  refine: number
  card0: number
  card1: number
  card2: number
  card3: number
  option_id0: number
  option_val0: number
  option_parm0: number
  option_id1: number
  option_val1: number
  option_parm1: number
  option_id2: number
  option_val2: number
  option_parm2: number
  option_id3: number
  option_val3: number
  option_parm3: number
  bound: number
  unique_id: number
  enchantgrade: number
}

export type ItemOption = {
  id: number
  val: number
  parm: number
}

export type Item = {
  id: number
  time: Date
  name: string
  amount: number
  price: number
  refine: number
  cards: number[]
  options: ItemOption[]
  bound: number
  iconUrl: string
  uniqueId: number
  enchantGrade: number
}

export type Transaction = {
  id: number
  item: Item
}
