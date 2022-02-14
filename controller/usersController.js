const User = require("../models/userModel");
const factory = require("../controller/handlerFactory");
const sharp = require("sharp");
const getAllUsers = factory.getAll(User);
const multer = require("multer");

//multer upload object options
// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // console.log(req.body);

//     cb(null, "public/img/users1");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.body.name}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
const uploadUserPhoto = upload.single("photo");
const resizeUserPhoto = async function (req, res, next) {
  try {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(200, 200, {
        position: "right top",
      })
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/users1/${req.file.filename}`);
    next();
  } catch (err) {
    res.json({
      message: "failed",
    });
  }
};

// const getAllUsers = async (req, res) => {
//   const users = await User.find();
//   res.json({
//     users,
//   });
// };
const deactivate = async function (req, res) {
  if (!req.body.password) {
    res.status(404).json({
      message: "Enter password for verification",
    });
    return;
  }
  const user = await User.findById(req.user.id)
    .select("+password")
    .select("+active");
  const correct = await user.correctPassword(user.password, req.body.password);
  if (!correct) {
    res.status(404).json({
      message: "Wrong Password!!",
    });
    return;
  }
  user.active = false;
  await user.save();
  res.json({
    message: "Deactivated",
  });
};
module.exports = {
  getAllUsers,
  deactivate,
  uploadUserPhoto,
  resizeUserPhoto,
};
