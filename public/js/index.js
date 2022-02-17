import "@babel/polyfill";
import { submitBtn, submitlistener } from "./login";
import { displayMap } from "./mapbox";
import { showAlerts } from "./alertsHandler";
import axios from "axios";
import { updationFuntionality, updationFrom } from "./userFormSubmit";
import { signupForm, newUser } from "./signup";
import {
  updatePasswordFunctionality,
  updatingPasswordForm,
} from "./userFormSubmit";
// import { hideAlert, showAlerts } from "./alertsHandler";

import { bookTrip } from "./stripe";

console.log("Bundle working fine just checking");

//LOGIN
if (submitBtn) submitBtn.addEventListener("submit", submitlistener);

//MAP
if (document.getElementById("map")) {
  const locations = JSON.parse(
    document.getElementById("map").dataset.locations
  );
  displayMap(locations);
  console.log("Map is there");
}
//LOGOUT
if (document.querySelector(".nav__el--logout")) {
  document
    .querySelector(".nav__el--logout")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      const res = await axios({
        method: "GET",
        url: "/trevell/api/v1/users/logout",
      });
      showAlerts("success", "logged out successfully!");
      window.setTimeout(() => {
        location.assign("/user/login");
      }, 1500);
      //   document.querySelector(".login--email_ph").value = "";
      //   document.querySelector(".login--password_ph").value = "";
    });
}
//UPDATING USER
if (document.querySelector(".user-view__menu"))
  updationFrom.addEventListener("submit", updationFuntionality);
//new user signup
// const signupForm = document.querySelector(".form--signup")
// console.log(signupForm);
// signupForm.addEventListener("submit", (e) => {
//   e.preventDefault();
//   console.log("pressed");
// });
//
//ADDING NEW USER
if (document.querySelector(".form--signup"))
  signupForm.addEventListener("submit", newUser);

//UPDATING PASSWORD
// console.log(document.getElementById("updating--password--form"));
if (document.getElementById("updating--password--form"))
  updatingPasswordForm.addEventListener("submit", updatePasswordFunctionality);

//book tour
if (document.querySelector("#book-trip")) {
  const bookBtn = document.querySelector("#book-trip");
  bookBtn.addEventListener("click", (e) => {
    e.target.textContent = "Processing...";
    const { tripId, userInfo } = e.target.dataset;
    // console.log(userInfo);
    bookTrip(tripId);
  });
}
