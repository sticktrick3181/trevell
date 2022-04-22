const Trip = require("../models/tripsModel");
const User = require("../models/userModel");

const Booking = require("../models/bookingsModel");
const factory = require("../controller/handlerFactory");
const endPointSecret = "whsec_oG6rKlyGFVNDDLSm53U9Wfa13iR05z6t";

// console.log("Secret stripe");
const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51KRu9ISCrnTbnttcnOnnJYulpvqf94mdIjN6guvs7Q0Bp9eXznw51OcVU8Czew1kMqPOBQM2LFQCN3sh484SrOlq0087bfktNL"
);
// const stripe = Stripe(process.env.STRIPE_SECRET);

// const stripe = require("stripe")(process.env.STRIPE_SECRET);
exports.getCheckoutSession = async function (req, res) {
  //get the trip to be booked
  // console.log("Hello");
  try {
    const trip = await Trip.findById(req.params.tripId);
    // console.log(trip);
    // console.log(`${req.protocol}://${req.get("host")}/trips/${trip.id}`);

    //create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      // success_url: `${req.protocol}://${req.get("host")}/?trip=${
      //   req.params.tripId
      // }&user=${req.user.id}&price=${trip.price}`,

      success_url: `${req.protocol}://${req.get("host")}`,

      cancel_url: `${req.protocol}://${req.get("host")}/trips/${trip.id}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tripId,
      line_items: [
        {
          name: `${trip.name} Trip`,
          description: trip.summary,
          images: [`${req.protocol}://${req.get("host")}/img/trips1/${trip.coverImage}`],
          amount: trip.price * 100,
          currency: "inr",
          quantity: 1,
        },
      ],
    });

    //reate session as response
    res.status(200).json({
      status: "success",
      session,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed to create session",
      error: err,
    });
  }
};

 const createBookingCheckout = async session => {
   const trip = session.client_reference_id;
  //  console.log("Trips" , trip);
   const userDetails = await User.findOne({email : session.customer_email});
   const user = userDetails.id;
  //  console.log("User" , user);
   const price = session.amount_total / 100;
  //  console.log("Price" , price);
   await Booking.create({trip , user , price});

 }
exports.webhookCheckout = async (req,res) => {

  const signature = req.headers['stripe-signature'];
  let event;
  try
  {
   event  = stripe.webhooks.constructEvent(req.body , signature , endPointSecret);
  }

  catch(err){
  res.status(400).send(`Webhook Error : ${err.message} `);
  return;
  }

  if(event.type === 'checkout.session.completed')
     createBookingCheckout(event.data.object);


  res.status(200).json({recieved : true}); 


}
// exports.createBookingCheckout = async (req, res, next) => {
//   //temporary
//   try {
//     const { trip, user, price } = req.query;
//     // console.log("Things");
//     // console.log(!trip && !user && !price);
//     if (!trip && !user && !price) return next();
//     await Booking.create({ trip, user, price });
//     res.redirect(req.originalUrl.split("?")[0]);
//   } catch (err) {
//     res.status(400).json({
//       message: "failed",
//       err,
//     });
//   }
// };


exports.getBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
