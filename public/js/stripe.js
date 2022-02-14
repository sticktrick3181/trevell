import axios from "axios";
import { showAlerts } from "./alertsHandler";

export const bookTrip = async (tripId) => {
  const stripe = Stripe(
    "pk_test_51KRu9ISCrnTbnttc94FRtrmhfZMdL0J1zAMJyKp5S8LGk48pFBeejw6VLu03kXtlTpXGCEWaJTqiftoU7MhitsCM00Pwl1PaDW"
  );
  try {
    //get checkout session from the server
    const session = await axios(
      `http://localhost:3000/trevell/api/v1/bookings/checkoutSession/${tripId}`
    );
    // console.log(session);
    if (session.data.status === "success") {
      showAlerts("success", "Being redirected to the merchant");
      window.setTimeout(() => {
        location.assign(`${session.data.session.url}`);
      }, 1500);
    }
    //create checkout form provided by stripe + charge the credid card
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
  } catch (err) {
    showAlerts("error", "Please try again!!");
  }
};
