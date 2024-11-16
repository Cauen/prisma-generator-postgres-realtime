import { getSampleDMMF } from '../tests/getPrismaSchema'
import { getDefaultConfig } from '../utils/config'
import { generateExtension } from '.'

describe('inputsGenerator', () => {
  it('should generate inputs', async () => {
    const dmmf = await getSampleDMMF('complex')
    const defaultConfig = getDefaultConfig()
    await generateExtension(defaultConfig, dmmf)
  })
})
