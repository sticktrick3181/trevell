const express = require("express");
const { route } = require("./tripRoutes");
const {
  protect,
  protectAthor,
  isLogedIn,
} = require("../controller/authController");
const router = express.Router();
const {
  getOverview,
  getTrip,
  loginUser,
  signupUser,
  account,
  getMyTrips,
  forgotPasswordPage,
  resetPasswordPage,
  errorPage,
} = require("../controller/viewController");
const bookingController = require("../controller/bookingController");

//ROUTES
router.get("/user/login", loginUser);
router.get("/user/signup", signupUser);
router.use(isLogedIn);

router.get("/", getOverview);
router.get("/user/me/my-trips", protect, getMyTrips);
router.get("/trips/:id", isLogedIn, getTrip);
router.get("/user/forgotPassword", forgotPasswordPage);
router.get("/user/resetPassword/:token", resetPasswordPage);

// router.get("/user/login", logoutUser);
router.get("/user/me", isLogedIn, protect, account);

router.get("*", errorPage);
module.exports = router;
