const { query } = require("express");
const { Model } = require("mongoose");

exports.deleteOne = (Model) =>
  async function (req, res) {
    try {
      const doc = await Model.findById(req.params.id);
      doc.remove();
      res.status(204).json("deleted");
    } catch (err) {
      res.json({
        message: "Couldn't delete",
      });
    }
  };
//WORKS AS FACTORY HANDELER FOR REVIEWS AND TRIPS BUT NOT FOR USER UPDATION BECAUSE BECAUSE USER'S DONT NEED ID PROVIDE THEIR ID AT THE URL BUT AS A PROTECTED ROUTE THE WILL GET UPDATED AUTOMATICALLY
exports.updateOne = (Model) =>
  async function (req, res) {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      res.status(200).json({
        message: "updated",
        data: doc,
      });
    } catch (e) {
      res.json({
        message: "Couldn't update",
      });
    }
  };
exports.createOne = (Model) =>
  async function (req, res) {
    try {
      const doc = await Model.create(req.body);
      await doc.save();
      res.status(200).json({
        status: "success",
        data: doc,
      });
    } catch (e) {
      res.status(404).json({
        status: "failed",
        error: e,
      });
    }
  };
exports.getOne = (Model, populateOptions) =>
  async function (req, res) {
    let q = Model.findById(req.params.id);
    if (populateOptions) {
      q = q.populate(populateOptions);
    }
    try {
      const doc = await q;
      res.status(200).json({
        status: "success",
        doc,
      });
    } catch (e) {
      res.status(404).json({
        status: "failed",
        error: e,
      });
    }
  };
exports.getAll = (Model, populateOptions) =>
  async function (req, res) {
    try {
      // 1) FILTERING
      if (req.query) {
        let queryString = JSON.stringify(req.query);
        queryString = queryString.replace(/\b(gte|lt|lte|gt)\b/g, (match) => {
          return `$${match}`;
        });
        // console.log(JSON.parse(queryString));
        req.query = JSON.parse(queryString);
      }
      //   console.log(req.query);
      let q = Model.find(req.query);
      if (populateOptions) {
        q = q.populate(populateOptions);
      }

      //2)SORTING
      if (req.query.sort) {
        let sortingString = JSON.stringify(req.query.sort).split(",").join(" ");
        req.query.sort = JSON.parse(sortingString);
        q = q.sort(req.query.sort);
      }
      //3)SHOW SPECIFIC FIELDS (PROJECTING)
      if (req.query.fields) {
        let feildsString = JSON.stringify(req.query.fields)
          .split(",")
          .join(" ");
        req.query.fields = JSON.parse(feildsString);
        q = q.select(req.query.fields);
      }
      //PAGINATION
      if (req.query.limit || req.query.page) {
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 20;
        const skip = (page - 1) * limit;
        if (skip >= (await Model.countDocuments())) {
          res.status(404).json({
            message: "page does not exist",
            status: 404,
          });
          return;
        }
        q = q.skip(skip).limit(limit);
      }

      //===>AWATING FINAL QUERY
      const doc = await q;
      res.status(200).json({
        status: "success",
        totalDocs: doc.length,
        doc,
      });
    } catch (e) {
      res.status(404).json({
        message: "failed",
        error: e,
      });
    }
  };

// const deleteATrip = async function (req, res) {
//   try {
//     const trip = await Trips.findById(req.params.id);
//     trip.remove();
//     res.json("deleted");
//   } catch (err) {
//     res.json({
//       message: "Couldn't delete",
//     });
//   }
// };
