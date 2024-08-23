import { PrismaClient } from '@prisma/client'

// const client = new Redis(process.env.REDIS_URL ?? '', {
//   tls: {
//     rejectUnauthorized: false,
//   },
// }) // Uses default options for Redis connection

// const redisAdapter = new RedisAdapter({
//   client,
//   cacheTime: 300,
//   transformer: {
//     serialize: (value) => SuperJSON.serialize(value),
//     deserialize: (value) => SuperJSON.deserialize(value),
//   },
// })

// const cacheMiddleware = createPrismaRedisCache({
//   models: [
//     {
//       model: 'Document',
//       excludeMethods: ['findFirst'],
//       cacheTime: 60,
//     },
//     {
//       model: 'Reading',
//       cacheTime: 60,
//     },
//     {
//       model: 'Team',
//       cacheTime: 60 * 60, // 1 hour, it is very uncommon for this to change. It is however queried quite often.
//     },
//     {
//       model: 'Accounts',
//       cacheTime: 60 * 15, // 15 minutes
//     },
//     {
//       model: 'ConnectionPoint',
//       cacheTime: 60 * 15, // 15 minutes
//     },
//     {
//       model: 'Plant',
//       cacheTime: 60 * 15, // 15 minutes
//       invalidateRelated: ['Destination', 'PlantCertificate'],
//     },
//     {
//       model: 'Notification',
//       invalidateRelated: ['NotificationDestination'],
//     },
//     // These change extremely rarely (Once a week at max, so only refresh them every 24 hours.)
//     {
//       model: 'EdielCodes',
//       cacheTime: 3600 * 24, // 24 hours
//     },
//     {
//       model: 'EicCode',
//       cacheTime: 3600 * 24, // 24 hours
//     },
//     {
//       model: 'User',
//       cacheTime: 60 * 30, // 30 minutes
//     },
//   ],
//   adapter: redisAdapter,
//   excludeModels: ['RawRequest', 'Session', 'Account'],
// })

const prismaClientSingleton = () => {
  console.debug('Creating prisma client with cache middleware..')
  return new PrismaClient() // .$extends(cacheMiddleware)
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
