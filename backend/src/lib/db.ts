import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

if (!globalThis.prismaGlobal) {
  console.log('Creating new PrismaClient')
  globalThis.prismaGlobal = prismaClientSingleton()
} else {
  console.log('Using existing PrismaClient')
}

const db = globalThis.prismaGlobal

export default db;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = db;
}