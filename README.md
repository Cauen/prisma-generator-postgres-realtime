# Prisma Generator Postgres Realtime

A prisma generator that turns your Postgres Database into a realtime Database and make it easy to subscribe to changes from Prisma Client type-safe Api

## How it works?

1. On `prisma generate` it will generate the `prismaExtension.ts` and `prismaRealtimeStatus.json` (to store what migrations have been generated and avoid regenerating them) file and the needed `migrations` to make your database send realtime events
2. Run `prisma migrate dev` to apply all generated migrations
3. Use the generated extension in prisma client to enable a new client/models method called `$subscribe` and start watching to realtime events sent

OBS:
- (Optional) Use the `generatorConfigPath` generator option to customize some options for your project (like excluding models, ...)

### Set up

#### Install generator 
`npm install --save-dev prisma-generator-postgres-realtime` (or yarn | pnpm version)

#### Install node-postgres peer dependancy
`npm install pg`

#### Add the generator to your `schema.prisma`

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

// new generator here ⬇️
generator realtime {
  provider            = "prisma-generator-postgres-realtime"
  generatorConfigPath = "../src/realtime/configs.js" // (optional)
}

/// This is an user
model User {
  id  String  @id
}
```

### Usage

1. Run `prisma generate` to generate the `prismaExtension.ts` file and migrations
2. Run `prisma migrate dev` to apply all generated migrations
3. Import the extension to your prisma client
```ts
/* src/db.ts */
import { PrismaClient } from "@prisma/client";
// Import auto generated extension
import { prismaRealtimeExtension } from './realtime/prismaExtension';

const prisma = new PrismaClient().$extends(PrismaExtension);

// global subscription
prisma.$subscribe(({ dbUser, model, newRow, oldRow, operation, tableName, tableSchema, timestamp }) => {
  console.log(`${operation} in ${model} at ${timestamp}`)
})

// typesafe model subscription
prisma.user.$subscribe(({ dbUser, model, newRow, oldRow, operation, tableName, tableSchema, timestamp }) => {
  console.log(`${operation} in ${model} at ${timestamp}`)
}, {
  // (optional) Enable logs for connection, by defaults only shows errors
  logLevel: "all",
  // (optional) Custom postgres connection string, by default it uses the one from `process.env.DATABASE_URL`
  connectionString: "postgres://postgres:postgres@localhost:5432/postgres"
})
```

### Configuration file (optional)
Create a configuration file (optional) and reference it in your `schema.prisma` generator config called `generatorConfigPath`

This configuration file enables some options like customize generated code, file paths, Prisma importer for some projects like Monorepos and disabling realtime for some specific models

```ts
// ./src/realtime/configs.js

// /** @type {import('prisma-generator-postgres-realtime').Config} */

/** @type {import('../../../../src').Config} */
module.exports = {
  migrations: {
    // Option to disable the generation of migrations
    disabled: false,
    // Directory to generate the custom migrations from project root
    outputDirPath: "./prisma/migrations",
    // Path to generate the status file to from project root
    outputStatusFilePath: "./src/realtime/prismaRealtimeStatus.json",
    // A function to replace generated source
    replacer: (str) => str
    // Included models in migrations
    excludeModels: [],
    // Excluded models in migrations (Ignored if includeModels is set)
    includeModels: [],
  },
  extension: {
    // Option to disable the generation of crud
    disabled: false,
    // Path to generate the inputs file to from project root
    outputFilePath: "./src/realtime/prismaExtension.ts",
    // The code to import the prisma client (Util for some projects like Monorepos)
    prismaClientImporter: `import { Prisma } from "@prisma/client";`,
    // A function to replace generated source
    replacer: (str) => str,
  },
  global: {
    // Function to run before generate
    beforeGenerate: (dmmf) => {},
    // Function to run after generate
    afterGenerate: (dmmf) => {},
    // A function to replace generated source
    replacer: (str) => str,
    // The name of the postgres trigger
    triggerName: "prisma_postgres_realtime_trigger",
  },
};

```

### Examples

Check for the [example](/examples/simple) for a running sample

### Disclaimer

#### Prisma Views

Currently, prisma does not enable us distinguish between models and views [(issue)](https://github.com/prisma/prisma/issues/17754). So if you are working with views you can disable generation of views from "options.migrations.excludeModels" or by simply deleting this part of code from the migration