import { PrismaClient } from '../generated/prisma'
// const prisma = new PrismaClient()

// El sitio de muestra (DEMO_MODE=1) solo puede usar una base cuyo nombre contenga "demo".
// Así, aunque falte la variable DATABASE_URL en el hosting, nunca llega a tocar la base real.
const assertDemoDatabase = () => {
    if (process.env.DEMO_MODE !== '1') return
    let name = ''
    try { name = new URL(process.env.DATABASE_URL ?? '').pathname } catch {}
    if (!/demo/i.test(name)) {
      throw new Error('DEMO_MODE=1 exige una DATABASE_URL cuya base tenga "demo" en el nombre.')
    }
}

const prismaClientSingleton = () => {
    assertDemoDatabase()
    return new PrismaClient()
  }
  
  declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
  }
  
  const prisma = globalThis.prisma ?? prismaClientSingleton()
  
  export default prisma
  
  if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
