import { ExtendedGeneratorOptions } from '../generator'
import { getSampleDMMF } from '../tests/getPrismaSchema'
import * as config from './config'

const cwd = process.cwd()

const generateOptions = async (generatorConfigPath?: string): Promise<ExtendedGeneratorOptions> => {
  const dmmf = await getSampleDMMF('simple')

  return {
    datamodel: '',
    datasources: [],
    generator: {
      sourceFilePath: '',
      name: 'realtime',
      provider: {
        fromEnvVar: null,
        value: 'ts-node --transpile-only ../../src/generator.ts',
      },
      output: {
        value: `${cwd}/src/tests/generated/inputs.ts`,
        fromEnvVar: 'null',
      },
      config: {},
      binaryTargets: [],
      previewFeatures: [],
    },
    generatorConfigPath,
    dmmf,
    otherGenerators: [
      {
        sourceFilePath: '',
        name: 'client',
        provider: { fromEnvVar: null, value: 'prisma-client-js' },
        output: {
          value: `${cwd}/src/tests/@prisma/client`,
          fromEnvVar: null,
        },
        config: {},
        binaryTargets: [],
        previewFeatures: [],
      },
    ],
    schemaPath: `${cwd}/src/tests/simpleSchema.prisma`,
    version: '272861e07ab64f234d3ffc4094e32bd61775599c',
  } satisfies ExtendedGeneratorOptions
}

afterEach(() => {
  delete process.env.POSTGRES_REALTIME_CONFIG_PATH
})

describe('getConfigPath', () => {
  const { getConfigPath } = config

  it('should return undefined', async () => {
    expect(
      getConfigPath({
        generatorConfigPath: undefined,
        schemaPath: '.',
      }),
    ).toBeUndefined()
  })

  it('should return `POSTGRES_REALTIME_CONFIG_PATH`', async () => {
    const configPath = '../config-file-env'
    process.env.POSTGRES_REALTIME_CONFIG_PATH = configPath

    expect(
      getConfigPath({
        generatorConfigPath: undefined,
        schemaPath: '.',
      }),
    ).toBe(configPath)
  })

  it('should return `generatorConfigPath`', async () => {
    const generatorConfigPath = '../config-file-path'

    expect(
      getConfigPath({
        generatorConfigPath,
        schemaPath: '.',
      }),
    ).toBe(generatorConfigPath)
  })

  it('should return `POSTGRES_REALTIME_CONFIG_PATH` over `generatorConfigPath`', async () => {
    const configPath = '../config-file-env'
    process.env.POSTGRES_REALTIME_CONFIG_PATH = configPath

    expect(
      getConfigPath({
        generatorConfigPath: '../config-file',
        schemaPath: '.',
      }),
    ).toBe(configPath)
  })
})

describe('parseConfig', () => {
  const { parseConfig } = config

  it(`should throw error if the file doesn't exist`, async () => {
    const fileName = './does-not-exist'
    const regexp = new RegExp(`^Cannot find module '${fileName}'`)

    await expect(parseConfig(fileName)).rejects.toThrow(regexp)
  })

  it(`should parse the config file`, async () => {
    const configs = await parseConfig('../tests/configs.js')

    expect(configs).toEqual({
      extension: expect.objectContaining({
        disabled: false,
        outputFilePath: './src/realtime/prismaExtension.ts',
      }),
      migrations: {
        disabled: false,
        outputDirPath: './prisma/migrations',
        outputStatusFilePath: './src/realtime/prismaRealtimeStatus.json',
      },
      global: expect.objectContaining({
        triggerName: 'prisma_postgres_realtime_custom',
      }),
    })
  })
})

describe('getConfig', () => {
  const { getConfig } = config
  const getDefaultConfigMock = jest.spyOn(config, 'getDefaultConfig')

  it(`should return the default config if a configPath doesn't exist`, async () => {
    const options = await generateOptions()
    const configs = await getConfig(options)

    expect(getDefaultConfigMock).toHaveBeenCalledWith()
    expect(configs).toEqual({
      extension: expect.objectContaining({
        outputFilePath: './src/realtime/prismaExtension.ts',
        replacer: expect.any(Function),
      }),
      global: expect.objectContaining({
        afterGenerate: expect.any(Function),
        beforeGenerate: expect.any(Function),
        triggerName: 'prisma_postgres_realtime_trigger',
        replacer: expect.any(Function),
      }),
      migrations: expect.objectContaining({
        disabled: false,
        outputDirPath: './prisma/migrations',
        outputStatusFilePath: './src/realtime/prismaRealtimeStatus.json',
        replacer: expect.any(Function),
      }),
    })
  })

  it(`should return custom configuration merged with the defaults`, async () => {
    const options = await generateOptions('../tests/configs.js')
    const configs = await getConfig(options)

    expect(getDefaultConfigMock).toHaveBeenCalledWith({
      triggerName: 'prisma_postgres_realtime_custom',
    })
    expect(configs).toEqual({
      extension: expect.objectContaining({
        replacer: expect.any(Function),
        outputFilePath: './src/realtime/prismaExtension.ts',
      }),
      global: expect.objectContaining({
        afterGenerate: expect.any(Function),
        beforeGenerate: expect.any(Function),
        replacer: expect.any(Function),
        triggerName: 'prisma_postgres_realtime_custom',
      }),
      migrations: expect.objectContaining({
        disabled: false,
        outputDirPath: './prisma/migrations',
        outputStatusFilePath: './src/realtime/prismaRealtimeStatus.json',
        replacer: expect.any(Function),
      }),
    })
  })
})
