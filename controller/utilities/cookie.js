const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000
  ),
  secure: process.env.NODE_ENV === "production" ? true : false,
  httpOnly: true,
};
module.exports = {
  cookieOptions,
};
