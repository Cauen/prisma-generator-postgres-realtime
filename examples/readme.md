# Running examples

## With source code

- Clone this repo
- `cd examples/simple`
- `yarn install`
- `yarn migrate`
- `yarn dev`
- Create/update/delete some data in database and see realtime events logs

## Without

- Clone this repo
- `cd examples/simple`
- `yarn install`
- `yarn add prisma-generator-postgres-realtime`
- Replace generator from `/prisma/schema.prisma` from `ts-node --transpile-only ../../src/generator.ts` to `prisma-generator-postgres-realtime`
- `yarn migrate`
- `yarn dev`
- Create/update/delete some data in database and see realtime events logs