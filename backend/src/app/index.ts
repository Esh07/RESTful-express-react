// import express from 'express'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()
const compression = require('compression')
import express from 'express'
const bodyParser = require('body-parser')
const router = express.Router();




const app = express();
app.use(bodyParser.json());
app.use(compression());

// A route declaration section
const { auth } = require('../api/auth/auth.routes');
// console.log(auth)
app.use('/auth', auth);

const { user } = require('../api/users/users.routes');
// console.log(user)
// app.use('/user', user);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World!' });

    // console.log('Hello World!')
}
);




export { app };
