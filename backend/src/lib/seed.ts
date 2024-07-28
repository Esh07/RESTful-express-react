import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export const userData: Prisma.UserCreateInput[] = [
    {
        email: 'esh@exmaple.com',
        name: 'Admin user',
        password: 'password',
        IsAdmin: true,
    },
    {
        email: 'esh1@exmaple.com',
        name: 'Test1 normal user',
        password: 'password',
        IsAdmin: false,
    },
    {
        email: 'esh3@exmaple.com',
        name: 'Test2 normal user',
        password: 'password',
        IsAdmin: false,
    },
]

async function seedData() {
    console.log(`Start seeding ...`)
    for (const u of userData) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: u.email },
            });
            if (!existingUser) {
                const user = await prisma.user.create({
                    data: u,
                })
                console.log(`Created user with id: ${user.id}`)
            } else {
                console.log(`User with email ${u.email} already exists.`)
            }
        }
        catch (e) {
            console.error(`Failed to create user: ${u.email}`)
            console.error(e)
        }
    }
    console.log(`Seeding finished.`);
}

seedData()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

export default seedData;    