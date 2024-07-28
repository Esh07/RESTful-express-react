// require('dotenv').config({
//     path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
//   });

  import {config as dotenvConfig} from 'dotenv';

  dotenvConfig({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
  });
  
const config = {
    development: {
      dialect: 'sqlite',
      storage: './dev.db'
    },
    test: {
      dialect: 'sqlite',
      storage: './test.db'
    },
    // production: {
    //   dialect: 'sqlite',
    //   storage: './database.sqlite'
    // }
  };

  export default config;