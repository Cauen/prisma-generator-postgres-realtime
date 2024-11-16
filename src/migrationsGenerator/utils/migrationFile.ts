import path from 'path'
import { DMMF } from '@prisma/generator-helper'
import { ConfigInternal } from '../../utils/config'
import { writeFile } from '../../utils/filesystem'
import { useTemplate } from '../../utils/template'

const functionTemplate = `CREATE OR REPLACE FUNCTION notify_postgres_realtime()
RETURNS TRIGGER AS $$
BEGIN
-- Convert the NEW row to JSON and send it as a notification
PERFORM pg_notify('#{triggerName}', json_build_object(
        'tableName', TG_RELNAME,
        'tableSchema', TG_TABLE_SCHEMA,
        'operation', TG_OP,
        'newRow', row_to_json(NEW),
        'oldRow', row_to_json(OLD),
  			'timestamp', now(),
        'dbUser', current_user
    )::text);
RETURN NEW;
END;
$$ LANGUAGE plpgsql;`

const tableTriggerTemplate = `CREATE OR REPLACE TRIGGER "#{tableName}_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "#{tableName}"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();`

export const generateMigrationsFile = async ({ config, models }: { config: ConfigInternal; models: DMMF.Model[] }) => {
  const content = [
    useTemplate(functionTemplate, { triggerName: config.global.triggerName }),
    ...models.map((model) => useTemplate(tableTriggerTemplate, { tableName: model.dbName || model.name })),
  ].join('\n\n')

  const isoOnlyNumbers = new Date()
    .toISOString()
    // Replace everything after dot
    .replace(/\..*/, '')
    // Keep only numbers
    .replace(/[^0-9]/g, '')
  const migrationNameRaw = `realtime_${models.map((el) => el.name.toLocaleLowerCase()).join('_')}`
  const migrationNameLimit = 150 // linux has 255 chars limit, but 150 is too long
  const migrationName =
    migrationNameRaw.length > migrationNameLimit ? `realtime_${models.length}_tables` : migrationNameRaw
  const migrationFolder = `${isoOnlyNumbers}_${migrationName}`

  await writeFile({
    config,
    location: path.join(config.migrations.outputDirPath, migrationFolder, 'migration.sql'),
    content,
    section: 'migrations',
  })
}
