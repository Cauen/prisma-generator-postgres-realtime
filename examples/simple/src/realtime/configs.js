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
    replacer: (str) => str,
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
