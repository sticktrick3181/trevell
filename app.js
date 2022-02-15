const express = require("express");
const path = require("path");
const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
//SERVING STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;

const morgan = require("morgan");
const tripRouter = require("./routes/tripRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const { connectToDB } = require("./data/databaseconnection");
const viewRouter = require("./routes/viewRoutes");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const csp = require("csp");

//HTTP SECURITY MIDDLEWARE "helmet"

/////////////////helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "data:", "blob:", "https:", "ws:"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        scriptSrc: [
          "'self'",
          "https:",
          "http:",
          "blob:",
          "https://*.mapbox.com",
          "https://js.stripe.com",
          "https://m.stripe.network",
          "https://*.cloudflare.com",
        ],
        frameSrc: ["'self'", "https://js.stripe.com"],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.tiles.mapbox.com",
          "https://api.mapbox.com",
          "https://events.mapbox.com",
          "https://m.stripe.network",
        ],
        childSrc: ["'self'", "blob:"],
        imgSrc: ["'self'", "data:", "blob:"],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          "data:",
          "blob:",
          "https://*.stripe.com",
          "https://*.mapbox.com",
          "https://*.cloudflare.com/",
          "https://bundle.js:*",
          "ws://127.0.0.1:*/",
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'", "data:", "blob:", "https:", "ws:"],
//         baseUri: ["'self'"],
//         fontSrc: ["'self'", "https:", "data:"],
//         scriptSrc: [
//           "'self'",
//           "https:",
//           "http:",
//           "blob:",
//           "https://*.mapbox.com",
//           "https://js.stripe.com",
//           "https://m.stripe.network",
//           "https://*.cloudflare.com",
//         ],
//         frameSrc: ["'self'", "https://js.stripe.com"],
//         objectSrc: ["'none'"],
//         styleSrc: ["'self'", "https:", "'unsafe-inline'"],
//         workerSrc: [
//           "'self'",
//           "data:",
//           "blob:",
//           "https://*.tiles.mapbox.com",
//           "https://api.mapbox.com",
//           "https://events.mapbox.com",
//           "https://m.stripe.network",
//         ],
//         childSrc: ["'self'", "blob:"],
//         imgSrc: ["'self'", "data:", "blob:"],
//         formAction: ["'self'"],
//         connectSrc: [
//           "'self'",
//           "'unsafe-inline'",
//           "data:",
//           "blob:",
//           "https://*.stripe.com",
//           "https://*.mapbox.com",
//           "https://*.cloudflare.com/",
//           "https://bundle.js:*",
//           "ws://127.0.0.1:*/",
//         ],
//         upgradeInsecureRequests: [],
//       },
//     },
//   })
// );

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", "data:", "blob:"],

//       baseUri: ["'self'"],

//       fontSrc: ["'self'", "https:", "data:"],

//       scriptSrc: ["'self'", "https://*.cloudflare.com"],

//       scriptSrc: ["'self'", "https://*.stripe.com"],

//       scriptSrc: ["'self'", "http:", "https://*.mapbox.com", "data:"],

//       frameSrc: ["'self'", "https://*.stripe.com"],

//       objectSrc: ["'none'"],

//       styleSrc: ["'self'", "https:", "unsafe-inline"],

//       workerSrc: ["'self'", "data:", "blob:"],

//       childSrc: ["'self'", "blob:"],

//       imgSrc: ["'self'", "data:", "blob:"],

//       connectSrc: ["'self'", "blob:", "https://*.mapbox.com"],

//       upgradeInsecureRequests: [],
//     },
//   })
// );
app.use(compression());
//DATA SANITIZATION FOR NoSQL INJECTIONS.
app.use(mongoSanitize());

//DATA SANITIZATION AGAINST XSS attacks.

//DATA SANITIZATION
app.use(xss());
//GLOBAL REQUESTS RATE LIMITER
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP , please try after some time",
});
app.use(limiter);

//DATABASE CONNECTION
connectToDB();

//EXPRESS INBUILT DATA FORMATTER
app.use(express.json());
app.use(express.urlencoded());

//DEV STATS
app.use(morgan("dev"));
app.use(cookieParser());
// app.use((req, res, next) => {
//   console.log(req.cookies);
//   next();
// });

//API ROUTES
app.use("/trevell/api/v1/trips", tripRouter);
app.use("/trevell/api/v1/users", userRouter);
app.use("/trevell/api/v1/reviews", reviewRouter);
app.use("/trevell/api/v1/bookings", bookingRouter);

app.use("/", viewRouter);
//express
//SERVER CREATION
app.listen(port, () => {
  console.log("Server created");
});
