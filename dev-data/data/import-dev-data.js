const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Tour = require('../../models/tourModels');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

dotenv.config({
  path: './config.env',
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

exports.connectToDB = function () {
  mongoose
    .connect(DB, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => console.log('DB connection successfully created'));
};

exports.importData = async (req, res) => {
  try {
    await Tour.create(tours);
    console.log('Data successfully added!');
  } catch (err) {
    console.log(err);
  }
};

exports.deleteData = async (req, res) => {
  try {
    await Tour.deleteMany();
    console.log('Successfuly deleted');
  } catch (err) {
    console.log(err);
  }
};
