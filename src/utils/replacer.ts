export type ReplacerSection = 'extension' | 'migrations' | 'statusFile' | 'debug.dmmf'

export type Replacer<T extends string = ''> = (
  generated: string,
  section: keyof { [S in ReplacerSection as S extends `${T}${infer _}` ? S : never]: never },
) => string
