const express = require("express");

const router = express.Router();
const {
  getTrips,
  getTrip,
  addTrip,
  deleteATrip,
  updateTrip,
  getTripsWithin,
  getDistances,
  uploadTripImages,
  resizeTripImages,
} = require("../controller/tripsController");
const {
  addReview,
  setTripUserIds,
} = require("../controller/reviewsController");
// const reviewRouter = require("../routes/reviewRoutes");
//PROTECTION TRIPS FOR LOGGED IN USERS ONLY
const { protect, protectAthor } = require("../controller/authController");

router
  .route("/")
  .get(getTrips)
  .post(protectAthor("admin", "lead-guide"), addTrip);
router
  .route("/:id")
  .get(protect, getTrip)
  .delete(protectAthor("admin", "lead-guide"), deleteATrip)
  .patch(
    protectAthor("admin", "lead-guide"),
    uploadTripImages,
    resizeTripImages,
    updateTrip
  );

//KEEPING IN MIND THAT THE AUTHORUTY ITSELF CANNOT POST REVIEWS FOR A TRIP THUS RESTRICTING IT ONLY TO THE USERS
router.route("/trips-within/:distance/centre/:latlng").get(getTripsWithin);
router.route("/distances/centre/:latlng").get(getDistances);

router
  .route("/:id/reviews")
  .post(protectAthor("user"), setTripUserIds, addReview);

module.exports = router;
