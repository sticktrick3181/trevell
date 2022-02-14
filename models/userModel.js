const mongoose = require("mongoose");

const { isAlpha, isEmail } = require("validator");

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user", "guide", "lead-guide"],
    default: "user",
  },
  lastName: {
    type: String,
  },
  middleName: {
    type: String,
    validate: [isAlpha, "Only aphabets"],
  },
  phoneNumber: String,
  email: {
    type: String,
    unique: [true, "Already exists"],
    validate: [isEmail, "Not a valid email"],
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (pass) {
        return pass === this.password;
      },
      message: "password should match",
    },
  },
  photo: { type: String, default: "placeholder_guides.png" },
  address: String,
  accountCreated: {
    type: Date,
    default: Date.now(),
  },
  //PASSWORD SPECIFIC FUNCTIONALITIES
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetTokenExpires: {
    type: Date,
    select: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  ///delete password confirm field
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.correctPassword = async function (pass1, pass2) {
  const res = await bcrypt.compare(pass2, pass1);
  return res;
};
userSchema.methods.passwordResetTokenGenerator = async function () {
  const resetToken = await crypto.randomBytes(64).toString("hex");
  //NOW DECODE IT TO STORE IN DATABASE

  //PASSWORD RESET TIME EXPIRES IN 5 MINUTES
  this.passwordResetToken = await crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 5 * 60 * 1000;
  // console.log("In url :", resetToken);
  // console.log("In database :", this.passwordResetToken);
  return resetToken;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
