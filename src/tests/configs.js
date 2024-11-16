// /** @type {import('prisma-generator-postgres-realtime').Config} */

/** @type {import('../utils/config').Config} */
module.exports = {
  extension: {
    disabled: false,
    outputFilePath: './src/realtime/prismaExtension.ts',
  },
  global: {
    triggerName: 'prisma_postgres_realtime_custom',
  },
  migrations: {
    disabled: false,
    outputDirPath: './prisma/migrations',
    outputStatusFilePath: './src/realtime/prismaRealtimeStatus.json',
  },
}
