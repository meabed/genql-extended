import { BatchOptions, createFetcher } from '../fetcher';
import { LinkedType } from '../types';
import { generateGraphqlOperation, GraphqlOperation } from './generateGraphqlOperation';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Client as WSClient, ClientOptions as WSClientOptions, createClient as createWSClient } from 'graphql-ws';
import { Observable } from 'zen-observable-ts';

type HeaderValue = string | string[] | number | boolean | null;
type RawHeaders = Record<string, HeaderValue>;

export type Headers = RawHeaders | (() => RawHeaders) | (() => Promise<RawHeaders>);

export interface ClientRequestConfig<D = any> extends AxiosRequestConfig<D> {
  headers?: RawHeaders;
}

export type BaseFetcher = {
  fetcherMethod: (operation: GraphqlOperation | GraphqlOperation[], config?: ClientRequestConfig) => Promise<any>;
  fetcherInstance: AxiosInstance | unknown | undefined;
};

export type ClientOptions = Omit<ClientRequestConfig, 'body' | 'headers'> & {
  url?: string;
  timeout?: number;
  batch?: BatchOptions | boolean;
  fetcherMethod?: BaseFetcher['fetcherMethod'];
  fetcherInstance?: BaseFetcher['fetcherInstance'];
  headers?: Headers;
  subscription?: { url?: string; headers?: Headers } & Partial<WSClientOptions>;
  webSocketImpl?: unknown;
};

export function createClient({
  queryRoot,
  mutationRoot,
  subscriptionRoot,
  ...options
}: ClientOptions & {
  queryRoot?: LinkedType;
  mutationRoot?: LinkedType;
  subscriptionRoot?: LinkedType;
}) {
  const { fetcherMethod, fetcherInstance } = createFetcher(options);
  const client: {
    wsClient?: WSClient;
    query?: Function;
    mutation?: Function;
    subscription?: Function;
    fetcherInstance: BaseFetcher['fetcherInstance'];
    fetcherMethod: BaseFetcher['fetcherMethod'];
  } = {
    fetcherInstance,
    fetcherMethod,
  };
  if (queryRoot) {
    client.query = (request, config) => {
      if (!queryRoot) throw new Error('queryRoot argument is missing');

      return client.fetcherMethod(generateGraphqlOperation('query', queryRoot, request), config);
    };
  }
  if (mutationRoot) {
    client.mutation = (request, config) => {
      if (!mutationRoot) throw new Error('mutationRoot argument is missing');

      return client.fetcherMethod(generateGraphqlOperation('mutation', mutationRoot, request), config);
    };
  }
  if (subscriptionRoot) {
    client.subscription = (request, config) => {
      if (!subscriptionRoot) {
        throw new Error('subscriptionRoot argument is missing');
      }
      const op = generateGraphqlOperation('subscription', subscriptionRoot, request);
      if (!client.wsClient) {
        client.wsClient = getSubscriptionClient(options, config);
      }
      return new Observable((observer) =>
        client.wsClient?.subscribe(op, {
          next: (data) => observer.next(data),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        }),
      );
    };
  }

  return client;
}
import WS from 'ws';

function getSubscriptionClient(opts: ClientOptions = {}, config?: ClientOptions): WSClient {
  const { url: httpClientUrl, subscription, webSocketImpl = {} } = opts || {};
  let { url, headers = {}, ...restOpts } = subscription || {};
  // by default use the top level url
  if (!url && httpClientUrl) {
    url = httpClientUrl?.replace(/^http/, 'ws');
  }

  if (!url) {
    throw new Error('Subscription client error: missing url parameter');
  }

  const wsOpts: WSClientOptions = {
    url,
    lazy: true,
    shouldRetry: () => true,
    retryAttempts: 3,
    connectionParams: async () => {
      let headersObject = typeof headers == 'function' ? await headers() : headers;
      headersObject = headersObject || {};
      return {
        headers: headersObject,
      };
    },
    ...restOpts,
    ...config,
  };

  if (
    typeof window !== 'undefined' &&
    typeof webSocketImpl === 'function' &&
    'constructor' in webSocketImpl &&
    'CLOSED' in webSocketImpl &&
    'CLOSING' in webSocketImpl &&
    'CONNECTING' in webSocketImpl &&
    'OPEN' in webSocketImpl
  ) {
    wsOpts.webSocketImpl = webSocketImpl;
  }
  return createWSClient(wsOpts);
}
