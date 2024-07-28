import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export const userData: Prisma.UserCreateInput[] = [
    {
        email: 'esh@exmaple.com',
        name: 'Esh',
        password: 'password',
        IsAdmin: true,
    },
    {
        email: 'test1@exmaple.com',
        name: 'Test1',
        password: 'password',
        IsAdmin: false,
    },
    {
        email: 'test2@exmaple.com',
        name: 'Test2',
        password: 'password',
        IsAdmin: false,
    },


]

async function main() {
    console.log(`Start seeding ...`)
    for (const u of userData) {
        const user = await prisma.user.create({
            data: u,
        })
        console.log(`Created user with id: ${user.id}`)
    }
    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
