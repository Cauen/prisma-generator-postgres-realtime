import { PrismaClient } from '@prisma/client';
// import { withPulse } from '@prisma/extension-pulse'
import { prismaRealtimeExtension } from './realtime/prismaExtension';

export const db = new PrismaClient({
  // log: ['error', 'info', 'query', 'warn'],
})
  .$extends(prismaRealtimeExtension)
// .$extends(
//   withPulse({ apiKey: "process.env.PULSE_API_KEY" })
// )
