import { getSampleDMMF } from '../tests/getPrismaSchema'
import { getDefaultConfig } from '../utils/config'
import { generateMigrations } from '.'

describe('crudGenerator', () => {
  it('should generate all files', async () => {
    const dmmf = await getSampleDMMF('complex')
    const defaultConfig = getDefaultConfig()
    await generateMigrations(defaultConfig, dmmf)
  })
})
