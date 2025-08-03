//used for imporating large data is a srcipt not used in dialy operation of the code

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); //this is npm i dotenv
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: './config.env' }); // must be before app, elese app dosent have access to process

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

//mongoose.connect(process.env.DATABASE_LOCAL,) speacil for local connection

mongoose.connect(DB).then((con) => {
  console.log('DB connection successful');
});

//Read JSON File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

//Import Data Into DB (node dev-data/data/import-dev-data.js --import)
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('data loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete all data from DB (node dev-data/data/import-dev-data.js --delete)
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data deteledddd');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
