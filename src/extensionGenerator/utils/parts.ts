import { DMMF } from '@prisma/generator-helper'
import { ConfigInternal, includeModel } from '../../utils/config'
import { useTemplate } from '../../utils/template'

const template = `#{prismaClientImport}
import { Client } from "pg";

const triggerName = "#{triggerName}";

type ChangePropsRaw<T> = {
  tableName: string;
  tableSchema: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  newRow: T;
  oldRow: T;
  timestamp: string;
  dbUser: string;
};
type ChangeProps<T> = ChangePropsRaw<T> & {
  model: Prisma.ModelName;
};
type FnHanler<T> = (props: ChangeProps<T>) => void;
type LogLevel = "none" | "error" | "all";
type Options = { logLevel?: LogLevel; connectionString?: string };
type Subscriber = {
  handler: FnHanler<any>;
  model: Prisma.ModelName | null;
  options?: Options;
};

const modelMaps: Record<string, Prisma.ModelName> = {
  #{modelMaps}
};

function log(
  options?: Options,
  logType?: "success" | "fail",
  message?: any,
  ...optionalParams: any
) {
  const logLevel = options?.logLevel || "error";
  if (logLevel === "none") return;
  if (logLevel === "error" && logType !== "fail") return;
  console.log("Prisma Realtime Extension:", message, ...optionalParams);
}

const pgClient = (() => {
  type State = {
    client: Client | null;
    clientStatus: "disconected" | "connecting" | "connected";
    // model = null to all
    subscribers: Array<Subscriber>;
  };
  const state: State = {
    client: null,
    clientStatus: "disconected",
    subscribers: [],
  };

  const getClient = async (options?: Options): Promise<Client> => {
    if (state.client) return state.client;

    try {
      log(options, "success", \`🟡 Trying to connect to PostgreSQL database\`);
      const pgClient = new Client({
        connectionString: options?.connectionString || process.env.DATABASE_URL,
      });
      state.clientStatus = "connecting";
      await pgClient.connect();
      state.client = pgClient;
      state.clientStatus = "connected";

      log(options, "success", \`✅ Connected to PostgreSQL database\`);
      return pgClient;
    } catch (error) {
      log(options, "fail", "Error connecting to PostgreSQL database:", error);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return getClient(options);
    }
  };

  async function startIfDisconnected(options?: Options) {
    if (state.clientStatus !== "disconected") return;

    try {
      const pgClient = await getClient(options);

      log(options, "success", "🟡 Trying to listen for table changes");
      await pgClient.query(\`LISTEN \${triggerName}\`);
      log(options, "success", "✅ Listening for table changes");

      pgClient.on("error", async (err) => {
        log(options, "fail", "PostgreSQL client error:", err);
        await pgClient?.end();
        state.client = null;
        state.clientStatus = "disconected";

        startIfDisconnected(options);
      });

      pgClient.on("notification", (notification) => {
        if (!notification.payload) return;
        if (notification.channel !== triggerName) return;
        const parsed: ChangePropsRaw<any> = JSON.parse(notification.payload);
        const model =
          modelMaps[parsed.tableName] || (parsed.tableName as Prisma.ModelName);
        const change: ChangeProps<any> = { ...parsed, model };

        for (const subscriber of state.subscribers) {
          if (subscriber.model !== null && subscriber.model !== change.model)
            continue;
          subscriber.handler(change);
        }
      });

      return pgClient;
    } catch (error) {
      log(options, "fail", "Error listening for table changes:", error);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      state.client = null;
      state.clientStatus = "disconected";
      return startIfDisconnected(options);
    }
  }

  async function onNotification(props: Subscriber) {
    await startIfDisconnected(props.options);
    state.subscribers.push(props);
  }

  return { onNotification };
})();

export const prismaRealtimeExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    client: {
      $subscribe: async (handler: FnHanler<any>, options?: Options) => {
        pgClient.onNotification({ handler, model: null, options });
      },
    },
    model: {
      $allModels: {
        async $subscribe<
          T,
          R extends Prisma.Result<T, any, "findMany">[number],
        >(this: T, handler: FnHanler<R>, options?: Options) {
          pgClient.onNotification({
            handler,
            model: (this as { name: Prisma.ModelName }).name,
            options,
          });
        },
      },
    },
  });
});
`

export function getExtensionContent(config: ConfigInternal, dmmf: DMMF.Document) {
  return useTemplate(template, {
    triggerName: config.global.triggerName,
    prismaClientImport: config.extension.prismaClientImporter,
    modelMaps: dmmf.datamodel.models
      .filter((model) => includeModel({ model, configs: config }))
      .filter((model) => model.dbName)
      .map((model) => `"${model.dbName}": "${model.name}",`)
      .join('\n  '),
  })
}
