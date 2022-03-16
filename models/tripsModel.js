const mongoose = require("mongoose");

const validator = require("validator");
// const User = require("./userModel");

const tripsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour should have a name"],
      minlength: [5, "A tour must have more than 10 letters in the name"],
      maxlength: [40, "A tour must have lesss than 40 letters in  the name"],
      unique: true,
    },
    city: {
      type: String,
      validate: [validator.isAlpha, "City name should contain Alphabets only"],
      required: true,
    },
    languages: {
      type: Array,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "A trip should have a price"],
    },
    duration: {
      type: Number,
      default: 10,
    },
    coverImage: {
      type: String,
      default: "placeholder_coverImage.jpeg",
      required: [true, "Cover image needed"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Group size for a tour should be provided"],
    },
    ratingsQuantity: { type: Number, default: 0 },

    ratingsAverage: {
      min: [0, "The ratings must be greater than  0"],
      max: [5, "The ratings must be less than  5"],
      type: Number,
      default: 4.5,
    },
    summary: {
      type: String,
      required: [true, "The trip must have a summary"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // imageCover: {
    //   type: String,
    // },
    images: [
      {
        type: String,
      },
    ],
    // images: [String],
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: { type: [Number], select: true },
      city: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
      },
      {
        place: { type: String },
      },
      {
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    createdAt: { type: Date, default: Date.now() },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tripsSchema.index({ startLocation: "2dsphere" });

tripsSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -accountCreated",
  });
  next();
});
tripsSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "trip",
  localField: "_id",
});
// tripsSchema.pre("save", async function (next) {
//   const list = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(list);
//   next();
// });

const Trip = mongoose.model("Trip", tripsSchema);
module.exports = Trip;
