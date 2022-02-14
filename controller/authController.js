const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { isEmail } = require("validator");
const Email = require("./utilities/email");
const { cookieOptions } = require("./utilities/cookie");
const createJwt = function (userToCheck, statusCode, res) {
  const tokenJwt = jwt.sign({ userToCheck }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  // res.cookie("jwt", tokenJwt, cookieOptions);
  res.cookie("jwtCookie", tokenJwt, cookieOptions);
  userToCheck.password = undefined;
  res.status(statusCode).json({
    message: `Success`,
    tokenJwt,
    user: userToCheck,
  });
};
const signUp = async (req, res) => {
  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
      photo: req.body.photo,
    });
    console.log(req.body);
    console.log(req.file);
    await newUser.save();
    const url = `${req.protocol}://${req.get("host")}/user/me`;
    await new Email(newUser, url).sendWelcome();
    console.log(url);
    const userToCheck = newUser;
    createJwt(userToCheck, 200, res);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid User Details",
      error: err,
    });
  }
};
const myInfo = async function (req, res) {
  res.status(200).json({
    status: "success",
    data: req.user,
  });
};
const checkUserStatus = function (req, res, next) {
  if (!userAtPresent) res.json("sign in to access");
  else next();
};
const login = async function (req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.json({
        message: "Enter email and password",
      });
      return;
    }
    if (!isEmail(email)) {
      res.status(404).json({
        status: 404,
        message: "Check your email syntax",
      });
      return;
    }
    const userToCheck = await User.findOne({ email })
      .select("+password")
      .select("+active");
    //SET ACTIVE FLAG TO "true" IS ITS PREVIOSLY INACTIVE
    userToCheck.active = true;
    await userToCheck.save();

    //CHECK FOR THE CORRECT PASSWORD ENTERED
    const correct = await userToCheck.correctPassword(
      userToCheck.password,
      password
    );
    if (!correct) {
      res.status(404).json({
        message: "Email or password doesn't match",
      });
      return;
    }
    //else create a jwt for the user who logged in
    // tokenJwt = jwt.sign({ userToCheck }, process.env.SECRET_KEY, {
    //   expiresIn: "1hr",
    // });
    // res.status(200).json({
    //   message: `logged in successfully`,
    //   tokenJwt,
    // });
    createJwt(userToCheck, 200, res);
  } catch (err) {
    res.status(404).json({
      status: 404,
      message: "User not found",
      error: err,
    });
  }
};
const logOut = async function (req, res) {
  tokenJwt = "";
  res.cookie("jwtCookie", tokenJwt, cookieOptions);
  res.status(200).json({
    message: "Logged out successfully",
    tokenJwt: "",
  });
};
const protect = async function (req, res, next) {
  //THIS IS THE MIDDLEWARE WHICH WILL ENSURE THAT THE JWT EXISTS FOR A BEARER AND ITS NOT BEEN MODIFIED.
  //BASICALLY IT CHECK FOR ALL THE POTENTIAL THREATS FOR IILEGAL LOGIN TO TRIPS SECTION
  try {
    let token = "";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwtCookie) {
      token = req.cookies.jwtCookie;
    }
    // if (!token) {
    //   res.status(401).json({
    //     status: 401,
    //     message: "Unauthorized access (Not logged in)",
    //   });
    // }
    const result = await jwt.verify(token, process.env.SECRET_KEY);
    // console.log(result.exp);
    //CHECK IF USER STILL EXISTS
    const resultExists = await User.findById(result.userToCheck._id).select(
      "+password"
    );
    // console.log(resultExists);
    console.log(typeof result.exp, typeof resultExists.passwordChangedAt);
    if (!resultExists)
      res.status(401).json({
        message: "User doesn't exist",
      });
    req.user = resultExists;
    //CHECK IF THE PASSWORD IS MODIFIED OR NOT
    if (
      resultExists.passwordChangedAt &&
      resultExists.passwordChangedAt > result.iat
    ) {
      res.status(401).json({
        status: 401,
        message: "Credentials changed",
        err: err,
      });
    }
    //IF ALL POSSIBLE THREATS ARE CHECKED AT THIS POINT,WE CAN CONTINUE FURTHUR.
    next();
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: "Unauthorized access (Not logged in)",
      err: err,
    });
  }
};
const isLogedIn = async function (req, res, next) {
  let token = req.cookies.jwtCookie;

  if (req.cookies.jwtCookie) {
    const result = await jwt.verify(token, process.env.SECRET_KEY);
    // console.log(result.exp);
    //CHECK IF USER STILL EXISTS
    const resultExists = await User.findById(result.userToCheck._id).select(
      "+password"
    );
    if (!resultExists) {
      res.status(401).json({
        message: "User doesn't exist",
      });
      return next;
    }
    //CHECK IF THE PASSWORD IS MODIFIED OR NOT
    if (
      resultExists.passwordChangedAt &&
      resultExists.passwordChangedAt > result.iat
    ) {
      res.status(401).json({
        status: 401,
        message: "Credentials changed",
        err: err,
      });
    }
    //IF CONTROL REACHES HERE IT MEANS THERE IS A LOGGED IN USER
    //locals object inside res takes these params to the pug template like passing the variables while rendering
    res.locals.user = resultExists;
    console.log("RES LOCALS FILE");
    console.log(res.locals);
    return next();
    //IF ALL POSSIBLE THREATS ARE CHECKED AT THIS POINT,WE CAN CONTINUE FURTHUR.
  } else return next();
};

///AUTHORITY PROTECTION
const protectAthor = ([...list]) =>
  async function (req, res, next) {
    //THIS IS THE MIDDLEWARE WHICH WILL ENSURE THAT THE JWT EXISTS FOR A BEARER AND ITS NOT BEEN MODIFIED.
    //BASICALLY IT CHECK FOR ALL THE POTENTIAL THREATS FOR IILEGAL LOGIN TO TRIPS SECTIONTHINGS RESTRICTED TO SOME ROLES ONLY.
    //ALSO IT WILL MAKE
    try {
      let token = "";
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies.jwtCookie) {
        token = req.cookies.jwtCookie;
      }
      // if (!token) {
      //   res.status(401).json({
      //     status: 401,
      //     message: "Unauthorized access (Not logged in)",
      //   });
      // }
      const result = await jwt.verify(token, process.env.SECRET_KEY);
      // console.log(result.exp);
      //CHECK IF USER STILL EXISTS
      const resultExists = await User.findById(result.userToCheck._id);
      console.log(resultExists);
      console.log(typeof result.exp, typeof resultExists.passwordChangedAt);
      if (!resultExists)
        res.status(401).json({
          message: "User doesn't exist",
        });
      req.user = resultExists;
      //CHECK IF THE PASSWORD IS MODIFIED OR NOT
      if (
        resultExists.passwordChangedAt &&
        resultExists.passwordChangedAt > result.iat
      ) {
        res.status(401).json({
          status: 401,
          message: "Credentials changed",
          err: err,
        });
      }
      //CHECK FOR admin OR lead-guide ELSE RESTRICT THE CHANGE THROUGH THIS MIDDLEWARE
      if (list.includes(resultExists.role)) {
        res.status(401).json({
          message: "Restricted functionality",
        });
        return;
      }
      //IF ALL POSSIBLE THREATS ARE CHECKED AT THIS POINT,WE CAN CONTINUE FURTHUR.
      next();
    } catch (err) {
      res.status(401).json({
        status: 401,
        message: "Unauthorized access (Not logged in)",
        err: err,
      });
    }
  };
const forgotPassword = async function (req, res) {
  if (!req.body.email) {
    res.status(404).json({
      message: "Enter your email to continue",
    });
    return;
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404).json({
      message: "User doesn't exist",
    });
    return;
  }
  try {
    const resetToken = await user.passwordResetTokenGenerator();
    console.log(resetToken);
    //SAVING THE ENCRYPTED TOKEN ON THE USERS DOCUMENT
    await user.save();
    //NOW WE WILL SEND THE ENCRYPTED TOKEN USING NODEMAILER😁
    const resetPasswordURL = `${req.protocol}://${req.get(
      "host"
    )}/trevell/api/v1/users/resetPassword/${resetToken}`;
    console.log(resetPasswordURL);

    await new Email(user, resetPasswordURL).sendPasswordResetToken();
    res.status(200).json({
      status: "Success",
      message: "Email Reset link mailed to user",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save();
    res.status(500).json({
      message: "Couldn't send email right now please try later",
      err,
    });
  }
  ///catch
  // catch (err) {
  //   res.status(404).json({
  //     message: "Incorrect user details",
  //   });
  // }
};
const resetPassword = async function (req, res) {
  //GETTING USER BASED UPON THE RESET TOKEN THAT WE SENT AS AN EMAIL.
  const encryptedToken = await crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(encryptedToken);
  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    res.status(404).json({
      message: "Please try again",
    });
    return;
  }
  //CHANGING THE CREEDNTIALS ONCE WE GOT THE USER
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  res.json({
    message: "Password Changed",
    tokenJwt: "",
  });
};
const updatePassword = async function (req, res) {
  //GET USER FROM THE COLLECTION
  //CHECK IF EXISTING PASSWORD IS CORRECT
  //UPDATE
  if (req.body.newPassword != req.body.confirmPassword) {
    res.status(404).json({
      message: "Password doesn't match",
    });
    return;
  }
  const user = await User.findOne({ email: req.user.email }).select(
    "+password"
  );
  const result = await user.correctPassword(
    user.password,
    req.body.existingPassword
  );
  if (!result) {
    res.status(404).json({
      message: "Wrong password!!",
    });
    return;
  }
  user.password = req.body.newPassword;
  await user.save();
  res.status(200).json({
    status: "Success",
    message: "Password successfully changed",
    tokenJwt: "",
  });
};
const updateUserInfo = async function (req, res) {
  try {
    console.log("Existing User");
    console.log(req.user);
    console.log("Body");
    console.log(req.body);
    console.log("File");
    console.log(req.file);
    const prevImage = req.user.photo;
    // if (!req.file) {
    //   req.file.filename = req.user.photo;
    // }
    if (req.file) {
      req.body.photo = req.file.filename;
    } else {
      req.body.photo = req.user.photo;
    }
    console.log(req.body);
    // const user1 = await User.findOne({ _id: req.user._id });
    // if (user1.role === "admin" || user1.role === "lead-guide") {
    //   res.status(404).json({
    //     message: `not allowed to change ${req.user.role}'s info`,
    //     status: "failed",
    //   });
    //   return;
    // }
    //ADDING THE PHOTO FROM REQ.FILE TO THE REQ BODY ITSELF (COMBINING THE TWO)
    // console.log(req.body);
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    }).select("+photo");
    fs.unlink(`/public/img/users1/${prevImage}`, (err) => {
      if (!err) console.log("file deleted");
      else console.log("file not deleted");
    });
    console.log("New Updated User");
    console.log(user);
    res.status(200).json({
      status: "Success",
      message: user,
    });
  } catch (e) {
    res.status(404).json({
      status: 404,
      message: "Hello",
      error: e,
    });
  }
};
const deactivateAthor = async function (req, res) {
  if (!req.body.user) {
    res.status(404).json({
      message: "please provide user id",
      status: "failed",
    });

    return;
  }
  const user = await User.findById(req.body.user).select("+active");
  user.active = false;
  await user.save();
  res.json({
    message: "Deactivated",
  });
};
module.exports = {
  login,
  logOut,
  signUp,
  checkUserStatus,
  protect,
  protectAthor,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateUserInfo,
  deactivateAthor,
  isLogedIn,
  myInfo,
};
