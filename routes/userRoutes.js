const express = require("express");
const router = express.Router();
//importing user specific and not authentication router
const {
  getAllUsers,
  deactivate,
  uploadUserPhoto,
  resizeUserPhoto,
} = require("../controller/usersController");
const { protect, protectAthor } = require("../controller/authController");
//importing authentication routes
const {
  login,
  signUp,
  logOut,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateUserInfo,
  deactivateAthor,
  myInfo,
} = require("../controller/authController");
router.route("/").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logOut);

//PROTECTION NEEDED FOR THE BELOW ROUTES SO ITS PROVIDED THROUGH COMMON MIDDLEWARE
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").patch(resetPassword);
router.use(protect);
router.route("/me").get(myInfo);
router.route("/updatePassword").patch(updatePassword);
router.route("/deactivate").delete(deactivate);
//  UPDATE USER BY USER ITSELF
//CANNOT UPDATE INFO REGARDING THE ADMINS
//USING MULTER MIDDLEWARE
router
  .route("/updateUserInfo")
  .patch(uploadUserPhoto, resizeUserPhoto, updateUserInfo);
//DELETE USER FOR AUTHORITY
router
  .route("/deactivateAuthor")
  .delete(protectAthor("admin,lead-guide"), deactivateAthor);

//SOME FEATURES TO ATHORITY FOR HANDLING USERS
router.route("/").get(protectAthor("admin", "lead-guide"), getAllUsers);
//delete users <remaining>
//update users <remaining>
//create users <remaining>

module.exports = router;
