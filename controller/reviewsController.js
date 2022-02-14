const Review = require("../models/reviewsModel");
const factory = require("../controller/handlerFactory");

const getReviews = factory.getAll(Review);
// const getReviews = async function (req, res) {
//   const filter = {};
//   if (req.params.id) {
//     filter.trip = req.params.id;
//   }
//   try {
//     const reviews = await Review.find(filter);
//     res.status(200).json({
//       status: "success",
//       reviewCount: reviews.length,
//       reviews,
//     });
//   } catch (e) {
//     res.status(404).json({
//       status: "failed",
//       error: e,
//     });
//   }
// };
const setTripUserIds = function (req, res, next) {
  if (!req.body.trip) {
    req.body.trip = req.params.id;
  }
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  next();
};

// const addReview = async function (req, res) {
//   try {
//     const review = await Review.create({
//       user: req.body.user,
//       trip: req.body.trip,
//       review: req.body.review,
//       rating: req.body.rating,
//     });
//     await review.save();
//     res.status(200).json({
//       status: "success",
//       review,
//     });
//   } catch (e) {
//     res.status(500).json({
//       status: "failed",
//       message: "Failed to add review",
//     });
//   }
// };
const getReview = factory.getOne(Review);
// async function (req, res) {
//   try {
//     const review = await Review.findById(req.params.id);
//     res.status(200).json({
//       status: "success",
//       review,
//     });
//   } catch (e) {
//     res.status(404).json({
//       status: "failed",
//       error: e,
//     });
//   }
// };
// const deleteAReview = async function (req, res) {
//   try {
//     const review = await Review.findById(req.params.id);
//     await review.remove();
//     res.status(200).json({
//       status: "deleted",
//     });
//   } catch (e) {
//     res.status(404).json({
//       status: "failed to delete",
//       error: e,
//     });
//   }
// };

//FACTORY HANDABLE FUNCTIONS

const deleteAReview = factory.deleteOne(Review);
const addReview = factory.createOne(Review);
const updateReview = factory.updateOne(Review);

module.exports = {
  getReview,
  addReview,
  getReviews,
  deleteAReview,
  updateReview,
  setTripUserIds,
};
