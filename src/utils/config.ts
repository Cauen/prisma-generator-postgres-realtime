import path from 'node:path'
import { ExtendedGeneratorOptions } from '../generator'
import { Replacer } from './replacer'
import type { DMMF } from '@prisma/generator-helper'

/** Interface used to configure generator behavior */
export interface Config {
  /** Input type generation config */
  migrations?: {
    /** Directory to generate the custom migrations from project root. Default: `'./prisma/migrations'` */
    outputDirPath?: string
    /** Disable generaton of migrations. Default: `false` */
    disabled?: boolean
    /** Disable generaton of migrations. Default: `false` */
    outputStatusFilePath?: string
    /** A function to replace generated source. Combined with global replacer config */
    replacer?: Replacer<'migrations'>
    /** Included models in migrations */
    includeModels?: string[]
    /** Excluded models in migrations (Ignored if includeModels is set) */
    excludeModels?: string[]
  }
  /** CRUD generation config */
  extension?: {
    /** Disable generaton of crud. Default: `false` */
    disabled?: boolean
    /** Path to generate the inputs file to from project root. Default: `'./src/realtime/prismaExtension.ts'` */
    outputFilePath?: string
    /** A function to replace generated source */
    replacer?: Replacer<'extension'>
    /** How to import Prisma. Default `"import { Prisma } from "@prisma/client";"` */
    prismaClientImporter?: string
  }
  /** Global config */
  global?: {
    /** Name of the trigger to send from database and watch from prisma extension. Default: 'prisma_postgres_realtime_trigger' */
    triggerName?: string
    /** A function to replace generated source */
    replacer?: Replacer
    /** Run function before generate */
    beforeGenerate?: (dmmf: DMMF.Document) => void
    /** Run function after generate */
    afterGenerate?: (dmmf: DMMF.Document) => void
  }
}

/** Type representing a configuration filled with default values where the original config was missing them, for internal purposes */
export type ConfigInternal = {
  migrations: NonNullable<Required<Config['migrations']>>
  extension: NonNullable<Required<Config['extension']>>
  global: NonNullable<Required<Config['global']>>
}

/** Parses the configuration file path */
export const getConfigPath = ({
  generatorConfigPath,
  schemaPath,
}: {
  generatorConfigPath?: string
  schemaPath: string
}): string | undefined => {
  const envConfigPath = process.env.POSTGRES_REALTIME_CONFIG_PATH
  const configPath = envConfigPath || generatorConfigPath // use env var if set

  if (!configPath) return undefined

  const schemaDirName = path.dirname(schemaPath)
  const optionsPath = path.join(schemaDirName, configPath)

  return optionsPath
}

/** Parses the configuration file based on the provided schema and config paths */
export const parseConfig = async (configPath: string): Promise<Config> => {
  const importedFile = await import(configPath) // throw error if dont exist
  const { migrations, global, extension }: Config = importedFile || {}

  return { migrations, global, extension }
}

export const getDefaultConfig: (global?: Config['global']) => ConfigInternal = () => ({
  migrations: {
    excludeModels: [],
    includeModels: [],
    disabled: false,
    outputDirPath: './prisma/migrations',
    outputStatusFilePath: './src/realtime/prismaRealtimeStatus.json',
    replacer: (str: string) => str,
  },
  extension: {
    prismaClientImporter: `import { Prisma } from "@prisma/client";`,
    disabled: false,
    outputFilePath: './src/realtime/prismaExtension.ts',
    replacer: (str: string) => str,
  },
  global: {
    replacer: (str: string) => str,
    triggerName: 'prisma_postgres_realtime_trigger',
    beforeGenerate: () => {
      // noop
    },
    afterGenerate: () => {
      // noop
    },
  },
})

/** Receives the config path from generator options, loads the config from file, fills out the default values, and returns it */
export const getConfig = async (extendedGeneratorOptions: ExtendedGeneratorOptions): Promise<ConfigInternal> => {
  const { generatorConfigPath, schemaPath } = extendedGeneratorOptions
  const configPath = getConfigPath({ generatorConfigPath, schemaPath })

  if (!configPath) return getDefaultConfig()

  const { extension, migrations, global } = await parseConfig(configPath)
  const defaultConfig = getDefaultConfig(global)

  return {
    migrations: { ...defaultConfig.migrations, ...migrations },
    extension: { ...defaultConfig.extension, ...extension },
    global: { ...defaultConfig.global, ...global },
  } satisfies ConfigInternal
}

export const includeModel = ({ model, configs }: { model: DMMF.Model; configs: ConfigInternal }): boolean => {
  const { includeModels, excludeModels } = configs?.migrations
  const modelName = model.name
  if (includeModels.length) return includeModels.includes(modelName)
  if (excludeModels.length) return !excludeModels.includes(modelName)
  return true
}
