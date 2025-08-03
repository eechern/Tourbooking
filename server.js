const mongoose = require('mongoose');
const dotenv = require('dotenv'); //this is npm i dotenv

//has to happen before anything this catches exception errors
process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION ERROR ');
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' }); // must be before app, elese app dosent have access to process
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

//mongoose.connect(process.env.DATABASE_LOCAL,) speacil for local connection

mongoose.connect(DB).then((con) => {
  console.log('DB connection successful');
});

//use tours scheme for making obejct out of class

// console.log(process.env); used to see what is inside process.
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION ERROR ');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recieved. shutting down server');
  server.close(() => {
    console.log('process terminated');
  });
});
