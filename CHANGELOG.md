# Changelog

## [3.2.18 - 2023-09-21](https://github.com/meabed/gqlts/compare/v3.2.17...v3.2.18)
- Update dependencies
- Update prettier to v3 in sdk cli generation
- Update CI
- Update tests

## [3.2.17 - 2023-01-25](https://github.com/meabed/gqlts/compare/v3.2.16...v3.2.17)
- Fix build

## [3.2.16 - 2023-01-25](https://github.com/meabed/gqlts/compare/v3.2.14...v3.2.16)
- Update axios to 1.2.4 and make types of axios request config and headers less strict
- Update dependencies

## [3.2.15 - 2023-01-05](https://github.com/meabed/gqlts/compare/v3.2.14...v3.2.15)
- No notable changes

## [3.2.14 - 2023-01-05](https://github.com/meabed/gqlts/compare/v3.2.13...v3.2.14)
- Fix terser compress if set to false for standalone build
- Fix file upload form data headers when files are present in request 

## [3.2.13 - 2022-12-30](https://github.com/meabed/gqlts/compare/v3.2.12...v3.2.13)
- replace uglifyjs with terser
- extend standalone bundle option to support name and compress `standalone-name` and `standalone-compress`

## [3.2.12 - 2022-12-30](https://github.com/meabed/gqlts/compare/v3.2.11...v3.2.12)
- Fix security issue with `terser` dependency
- Improve build test artifacts

## [3.2.11 - 2022-12-30](https://github.com/meabed/gqlts/compare/v3.2.10...v3.2.11)
- Added browser standalone bundle using browserify
- Added e2e demo app to test sdk generation, react integration and browser bundle
- Upgrade axios
- Update dependencies
- Refactor code ( prettier )
- Refactor tests

## [3.2.10](https://github.com/meabed/gqlts/compare/v3.2.9...v3.2.10)
- Downgrade axios to 0.27.2 as there is some issues: https://github.com/axios/axios/issues/5005
- Upgrade dependencies

## [3.2.9](https://github.com/meabed/gqlts/compare/v3.2.8...v3.2.9)
- Upgrade axios to 1.0.0
- Upgrade dependencies

## 3.2.8
- Fix scalarsMap when index is 0
- Fix typemap when index is 0
- Update package react-query to @tanstack/react-query

## 3.2.6
- Add Client Interface Generic for Fetcher Instance ( FI ) and Request Config ( RC )


## 3.2.5
- Added 2 parameters to the generator to make it easy when you generate multiple clients ( as sometime typescript mixes types and interfaces ):
  - '-ms' methodSuffix (default: '') to suffix generated method names ( createClient > createClient_ms )
  - '-mp' methodPrefix (default: '') to prefix generated method names ( createClient > methodPrefix_createClient )

## 3.2.4
Update packages
  - graphql-ws
  - ws
Update readme
Update website docs
Update keywords in package.json

## 3.2.3
Rename library to `gqlts`
Fix subscription parameters
Added example usage of subscription with demo graphql server

## 3.2.2
Fix optional parameters in client 

## 3.2.1
Allow re-assigning client fetcherMethod 
Use client.fetcherMethod from client to fetch the data

## 3.2.0
Expose axios client outside the library to enable adding interceptors
Replace fetch with axios
Fix tests
Fix integration tests and try clients
Remove chaining
Adding ability to pass config to axios in requests
Fix batcher to use axios

## 3.1.10
Change response format to be {data: {}, errors: [], extensions: {}}
Replace fetch with axios
Fix tests
Fix integration tests and try clients
Remove chaining
Adding ability to pass config to axios in requests
Fix batcher to use axios

## 3.0.0
Upgrade all dependency packages
Migrate from graphql-subscriptions-transport-ws to graphql-ws
General Improvement and enhancement

Fixed problem generating interfaces without any implementation
## 2.10.0

Fixed problem generating interfaces without any implementation

## 2.9.0

Support for more than one : in -S option (by @boredland)

Fixed declaration files generations for enums (by @DanielRose)

## 2.8.0

Add `as const` on enum objects to not use type object values as strings

## 2.7.0

Added `enumGraphqlEnumName` exports to get access to enum strings

## 2.6.0

-   Query any interface on an union, not only the common ones
-   Fixed \_\_typename always optional

## 2.5.0

-   Do not query falsy values when using \_\_scalar

## 2.4.0

-   Ability to query interfaces that a union implements https://github.com/remorses/gqlts/issues/44

## 2.3.3

-   `gqlts-cli` package becomes `@gqlts/cli`
-   `gqlts-runtime` package becomes `@gqlts/runtime`
-   headers can be an async function
-   you can now add an operation name to a query using `__name`
-   only generate commonjs code by default (using require and module.exports) to prevent people from importing from `index.esm`, use the `--esm` flag if you want to use esm
-   response types only include requested fields
-   added built in batching (see https://gqlts.vercel.app/docs/usage/batching-queries)
-   `--sort` flag
-   generated `types.json` now is `types.js`
-   smaller `types.js` and hence smaller bundle size
-   made the website page converter to convert from graphql queries to gqlts code: https://gqlts.vercel.app/converter
-   custom `fetcher` now has type `(operation: GraphqlOperation | GraphqlOperation[], ) => Promise<ExecutionResult>` to support built in batching
-   added a `@gqlts/cli/printer` module to print a graphql query AST to gqlts code
