import axios from "axios";
import { showAlerts } from "./alertsHandler";
export const submitBtn = document.querySelector(".form--login");
// document.querySelector(".login--email_ph").value = "";
// document.querySelector(".login--password_ph").value = "";
export const submitlistener = async function (e) {
  try {
    e.preventDefault();
    console.log("pressed");
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const res = await axios({
      method: "POST",
      url: "http://localhost:3000/trevell/api/v1/users/login",
      data: {
        email,
        password,
      },
    });
    console.log(res);

    if (res.data.message === "Success") {
      showAlerts("success", "logged in!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
      // alert("User logged in successfully");
      // window.setTimeout(() => {
      //   location.assign("/");
      // }, 1500);
    }
  } catch (e) {
    showAlerts("error", e.response.data.message);
  }
};
