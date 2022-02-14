const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.ObjectId,
    ref: "Trip",
    required: [true, "Booking must belong to a tour"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a tour"],
  },
  price: {
    type: Number,
    required: [true, "Booking must have a price"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});
bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "trip",
    select: "name",
  });
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
