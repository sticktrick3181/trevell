import axios from "axios";
import { showAlerts } from "./alertsHandler";
export const submitBtnResetPassword = document.querySelector(
  ".form--resetPassword"
);
// document.querySelector(".login--email_ph").value = "";
console.log("Hello");
// document.querySelector(".login--password_ph").value = "";
export const submitlistenerResetPassword = async function (e) {
  console.log("Pressed reset password");
  try {
    console.log("Entered");
    e.preventDefault();
    // console.log("pressed");
    const passNew = document.querySelector("#password-new").value;
    const passNewConfirm = document.querySelector(
      "#password-new-confirm"
    ).value;
    console.log(document.URL);

    const res = await axios({
      method: "PATCH",
      url: `/trevell/api/v1/users/resetPassword/${document.URL.split("/")[5]}`,
      data: {
        password: passNew,
        passwordConfirm: passNewConfirm,
      },
    });
    console.log(res);

    if (res.data.message === "Password Changed") {
      showAlerts("success", "password changed");
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
