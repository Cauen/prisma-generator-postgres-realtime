import { DMMF } from '@prisma/generator-helper'
import { includeModel, type ConfigInternal } from '../../utils/config'
import { readFile, writeFile } from '../../utils/filesystem'

type Content = {
  migratedModels: string[]
}

const getContent = async ({ config }: { config: ConfigInternal }): Promise<Content | undefined> => {
  const filePath = config.migrations.outputStatusFilePath
  try {
    const fileContent = await readFile(filePath)
    if (fileContent) return JSON.parse(fileContent) as Content
    return undefined
  } catch (err) {
    return undefined
  }
}

const setContent = async ({ config, content }: { config: ConfigInternal; content: Content }) => {
  return writeFile({
    config,
    location: config.migrations.outputStatusFilePath,
    content: JSON.stringify(content, null, 2),
    section: 'statusFile',
  })
}

export const generateStatusFile = async ({ config, dmmf }: { config: ConfigInternal; dmmf: DMMF.Document }) => {
  const currentContent = await getContent({ config })
  const alreadyMigratedModels = currentContent?.migratedModels || []
  const models = dmmf.datamodel.models
  const includedModels = models.filter((model) => includeModel({ model, configs: config }))
  const modelNames = includedModels.map((model) => model.name)
  const unmigratedModels = includedModels.filter((model) => !alreadyMigratedModels.includes(model.name))
  const content: Content = { migratedModels: modelNames }

  return {
    unmigratedModels,
    apply: () => setContent({ config, content }),
  }
}
