import { env } from '../env'
import { ConfigInternal } from '../utils/config'
import { writeFile } from '../utils/filesystem'
import { getExtensionContent } from './utils/parts'
import type { DMMF } from '@prisma/generator-helper'

export async function generateExtension(config: ConfigInternal, dmmf: DMMF.Document): Promise<void> {
  if (env.isTesting)
    await writeFile({
      config,
      section: 'debug.dmmf',
      content: JSON.stringify(dmmf, null, 2),
      location: 'dmmf.json',
    })

  if (config.extension.disabled) return
  const location = config.extension.outputFilePath

  const content = getExtensionContent(config, dmmf)

  await writeFile({
    config,
    section: 'extension',
    content,
    location,
  })
}
