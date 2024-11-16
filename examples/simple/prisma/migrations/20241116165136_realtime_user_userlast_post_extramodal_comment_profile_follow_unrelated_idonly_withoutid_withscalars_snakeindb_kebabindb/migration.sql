CREATE OR REPLACE FUNCTION notify_postgres_realtime()
RETURNS TRIGGER AS $$
BEGIN
-- Convert the NEW row to JSON and send it as a notification
PERFORM pg_notify('prisma_postgres_realtime_trigger', json_build_object(
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
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER "User_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "User"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "UserLast_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "UserLast"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "Post_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "Post"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "ExtraModal_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "ExtraModal"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "Comment_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "Comment"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "Profile_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "Profile"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "Follow_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "Follow"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "Unrelated_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "Unrelated"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "IdOnly_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "IdOnly"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "WithoutID_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "WithoutID"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "WithScalars_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "WithScalars"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "snake_in_db_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "snake_in_db"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();

CREATE OR REPLACE TRIGGER "kebab-in-db_table_update"
AFTER INSERT OR UPDATE OR DELETE ON "kebab-in-db"
FOR EACH ROW
EXECUTE FUNCTION notify_postgres_realtime();