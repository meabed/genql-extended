import { FieldsSelection, GraphqlOperation, ClientOptions, Observable, NoExtraProperties } from 'genql-runtime'
import { SubscriptionClient } from 'subscriptions-transport-ws'
export * from './schema'
import { QueryRequest, QueryPromiseChain, Query } from './schema'
export declare const createClient: (options?: ClientOptions) => Client
export declare const everything: { __scalar: boolean }
export declare const version: string

export interface Client {
  wsClient?: SubscriptionClient

  query<R extends QueryRequest>(request: NoExtraProperties<QueryRequest, R>): Promise<FieldsSelection<Query, R>>

  chain: {
    query: QueryPromiseChain
  }
}

export type QueryResult<fields extends QueryRequest> = FieldsSelection<Query, fields>

export declare const generateQueryOp: (fields: QueryRequest) => GraphqlOperation


