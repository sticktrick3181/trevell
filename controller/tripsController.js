const Trips = require("../models/tripsModel");
const factory = require("../controller/handlerFactory");
const multer = require("multer");
const sharp = require("sharp");

//1.GET
// const getTrips = async function (req, res) {
//   try {
//     const trips = await Trips.find();
//     res.json({
//       trips,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };
const getTrips = factory.getAll(Trips, {
  path: "reviews",
  select: "-__v",
});

//2. GET SINGLE TRIP

// const getTrip = async function (req, res) {
//   try {
//     const id = req.params.id;
//     const trip = await Trips.findById(id)
//       .populate({
//         path: "reviews",
//         select: "-__v",
//       })
//       .select("-locations -guide -__v");
//     res.json({
//       trip,
//     });
//   } catch (err) {
//     res.json({
//       message: "Check ID again",
//       error: err,
//     });
//   }
// };

//3. POST
// const addTrip = async function (req, res) {
//   try {
//     const tripToAdd = await Trips.create(req.body);
//     tripToAdd.save();
//     res.json({
//       message: "added",
//       trip: tripToAdd,
//     });
//   } catch (err) {
//     res.json({
//       err,
//     });
//   }
// };
const getTrip = factory.getOne(Trips, {
  path: "reviews",
  select: "-__v",
});
const deleteATrip = factory.deleteOne(Trips);
const updateTrip = factory.updateOne(Trips);
const addTrip = factory.createOne(Trips);
const getTripsWithin = async function (req, res) {
  const { distance: radius, latlng } = req.params;
  const [lng, lat] = latlng.split(",");
  // console.log({ latitude, longitude });
  if (!lat || !lng) {
    res.status(404).json({
      message: "please provide valid valid latitude and longitude",
    });
  }
  // const distRadians = unit == "km" ? radius / 6378.1 : radius / 3963.2;
  // console.log(distRadians);
  const trips = await Trips.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius / 6378.1] },
    },
  });
  res.status(200).json({
    totalTrips: trips.length,
    message: "success",
    trips,
  });
};

// const deleteATrip = async function (req, res) {
//   try {
//     const trip = await Trips.findById(req.params.id);
//     trip.remove();
//     res.json("deleted");
//   } catch (err) {
//     res.json({
//       message: "Couldn't delete",
//     });
//   }
// };
const getDistances = async function (req, res) {
  const { distance: radius, latlng } = req.params;
  const [lng, lat] = latlng.split(",");
  // console.log({ latitude, longitude });
  if (!lat || !lng) {
    res.status(404).json({
      message: "please provide valid valid latitude and longitude",
    });
  }
};

//UPLOADING IMAGES OF TRIPS
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
const uploadTripImages = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);
const resizeTripImages = async function (req, res, next) {
  try {
    // console.log(req.files);
    // console.log("PARAMS ", req.params);
    if (!req.files.coverImage || !req.files.images) return next();

    //---FOR COVER IMAGE
    req.body.coverImage = `trip-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.coverImage[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      //SAVING THE BODY SO PUTTING FILENAME IN THE BODY ITSELF
      .toFile(`public/img/trips1/${req.body.coverImage}`);

    //---FOR TRIP IMAGES
    //CREATING AN EMPTY ARRAY FOR THE NAMES OF THE IMAGES THAT WE ARE GONNA PUT IN THE REQ.BODY OBJECT
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, index) => {
        let imageName = `trip-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          //SAVING THE BODY SO PUTTING FILENAME IN THE BODY ITSELF
          .toFile(`public/img/trips1/${imageName}`);
        req.body.images.push(imageName);
      })
    );

    next();
  } catch (err) {
    res.status(404).json({
      message: "failed",
      error: err,
    });
  }
};

// const resizeTripImages = (req, res, next) => {
//   console.log(req.files);
//   next();
// };

module.exports = {
  getTrips,
  getTrip,
  addTrip,
  deleteATrip,
  updateTrip,
  getTripsWithin,
  getDistances,
  uploadTripImages,
  resizeTripImages,
};
