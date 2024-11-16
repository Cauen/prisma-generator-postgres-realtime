import { ConfigInternal } from '../utils/config'
import { generateMigrationsFile } from './utils/migrationFile'
import { generateStatusFile } from './utils/statusFile'
import type { DMMF } from '@prisma/generator-helper'

export async function generateMigrations(config: ConfigInternal, dmmf: DMMF.Document): Promise<void> {
  if (config.migrations.disabled) return

  const { apply, unmigratedModels } = await generateStatusFile({ config, dmmf })
  if (!unmigratedModels.length) return

  await generateMigrationsFile({ config, models: unmigratedModels })

  // Do some thing
  await apply()
}
