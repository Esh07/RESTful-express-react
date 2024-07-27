// import express from 'express'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()
const compression = require('compression')
import express from 'express'
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(compression())

export { app };
