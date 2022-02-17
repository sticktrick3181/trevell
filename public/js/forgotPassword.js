import axios from "axios";
import { showAlerts } from "./alertsHandler";
export const submitBtnForgotPassword = document.querySelector(
  ".form--forgotPassword"
);
// document.querySelector(".login--email_ph").value = "";
// document.querySelector(".login--password_ph").value = "";
export const submitlistenerForgotPassword = async function (e) {
  console.log("Pressed forgot password");
  try {
    console.log("Entered");
    e.preventDefault();
    // console.log("pressed");
    const email = document.querySelector("#emailFP").value;
    const res = await axios({
      method: "POST",
      url: "/trevell/api/v1/users/forgotPassword",
      data: {
        email,
      },
    });
    console.log(res);

    if (res.data.status === "Success") {
      showAlerts("success", "Reset Link Sent to your registered email");
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
