const mongoose = require("mongoose");
const Trip = require("../models/tripsModel");
// const User = require("./userModel");

const reviewsSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty"],
      max: 3000,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    trip: {
      type: mongoose.Schema.ObjectId,
      ref: "Trip",
      required: [true, "Review must belong to a trip"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewsSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName role",
  });
  next();
});
//EVERY USER CAN WRITE ONLY ONE REVIEW FOR A PARTICULAR TRIP
reviewsSchema.index({ trip: 1, user: 1 }, { unique: true });
reviewsSchema.statics.calcAvgRating = async function (tripId) {
  //AGGREGATION PIPELINE FOR COLLECTING THE STATS FROM THE TRIPS
  const stats = await this.aggregate([
    {
      $match: { trip: tripId },
    },
    {
      $group: {
        _id: "$trip",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  // console.log(stats);
  await Trip.findByIdAndUpdate(tripId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating,
  });
};
reviewsSchema.statics.checkSimilarReview = async function (userId, review) {
  const r = await this.find({ user: userId, review });
  if (r) return true;
  return false;
};
reviewsSchema.post("save", async function () {
  await this.constructor.calcAvgRating(this.trip);
});
// //REVIEWS DONT GET UPDATED ON DELETING OR UPDATING ONE
// reviewsSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   next();
// });
// reviewsSchema.post(/^findOneAnd/, async function () {
//   await this.r.constructor.calcAvgRating(this.r.trip);
// });
// tripsSchema.pre("save", async function (next) {
//   const list = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(list);
//   next();
// });

const Review = mongoose.model("Review", reviewsSchema);
module.exports = Review;
