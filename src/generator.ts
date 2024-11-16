import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper'
import { generateExtension } from './extensionGenerator'
import { generateMigrations } from './migrationsGenerator'
import { getConfig } from './utils/config'

// Types from the generator, in `schema.prisma`
type SchemaGeneratorExtensionOptions = { generatorConfigPath?: string }

// default config from generator, with the path option
export type ExtendedGeneratorOptions = SchemaGeneratorExtensionOptions & GeneratorOptions

generatorHandler({
  onManifest: () => ({
    prettyName: 'Postgres Realtime',
    requiresGenerators: ['prisma-client-js'],
    defaultOutput: './src/realtime/prismaExtension.ts',
  }),
  onGenerate: async (options) => {
    const generatorConfig: ExtendedGeneratorOptions = { ...options, ...options.generator.config }
    const config = await getConfig(generatorConfig)

    config.global.beforeGenerate(options.dmmf)
    await generateMigrations(config, options.dmmf)
    await generateExtension(config, options.dmmf)
    config.global.afterGenerate(options.dmmf)
  },
})
