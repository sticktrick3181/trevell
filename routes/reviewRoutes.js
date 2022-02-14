const express = require("express");

const router = express.Router();

const { protect, protectAthor } = require("../controller/authController");

const {
  getReview,
  setTripUserIds,
  addReview,
  getReviews,
  deleteAReview,
  updateReview,
} = require("../controller/reviewsController.js");
router.use(protect);
router
  .route("/")
  .get(getReviews)
  .post(protectAthor("user"), setTripUserIds, addReview);
router.route("/:id").get(getReview);
//AUTHORITY
router.use(protectAthor("admin", "lead-guide"));
router.route("/:id").delete(deleteAReview).patch(updateReview);
module.exports = router;
