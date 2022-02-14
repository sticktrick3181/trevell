const Trip = require("../models/tripsModel");
const Booking = require("../models/bookingsModel");

exports.getOverview = async function (req, res) {
  //GETTING TRIP DATA FROM COLLECTION
  const allTrips = await Trip.find().select("+createdAt");
  res.status(200).render("overview", {
    title: "Trips Overview",
    allTrips,
  });
};
exports.getTrip = async function (req, res) {
  const trip = await Trip.findOne({ _id: req.params.id }).populate({
    path: "reviews",
    fields: "user review rating",
  });
  res
    .status(200)
    .set(
      "Content-Security-Policy",
      "default-src 'self' https://.mapbox.com https://.stripe.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )

    .render("trip", {
      title: trip.name,
      trip,
    });
};
exports.loginUser = async function (req, res) {
  res.status(200).render("login", {
    title: "Account Login",
  });
};
exports.logoutUser = async function (req, res) {
  res.status(200).render("login");
};
exports.account = async function (req, res) {
  // console.log("RES LOCALS ACCOUNT FILE");
  // console.log(res.locals.user);
  res.status(200).render("accountTemplate", {
    title: "User Details",
    user: res.locals.user,
  });
};
exports.getMyTrips = async function (req, res) {
  // console.log(req.user);
  const id = req.user._id;
  // console.log(id);
  //find all bookings
  const bookings = await Booking.find({ user: id });
  // console.log(bookings);
  const tripIds = bookings.map((e) => e.trip);
  const trips = await Trip.find({ _id: { $in: tripIds } });

  res.status(200).render("overview", {
    title: "My Trips",
    allTrips: trips,
  });

  //find tours with the returned id's
};
exports.errorPage = function (req, res) {
  res.status(404).render("error", {
    type: "failed",
  });
};
exports.signupUser = function (req, res) {
  res.status(200).render("signup", {
    title: "Sign Up Page",
    type: "New User",
  });
};
