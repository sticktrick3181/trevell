const express = require("express");

const router = express.Router();

const { protect, protectAthor } = require("../controller/authController");

const bookingController = require("../controller/bookingController");

router.use(protect);

router.get("/checkoutSession/:tripId", bookingController.getCheckoutSession);

router.use(protectAthor("admin", "lead-guide"));
router
  .route("/")
  .get(bookingController.getBookings)
  .post(bookingController.createBooking);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
