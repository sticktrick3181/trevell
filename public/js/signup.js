import axios from "axios";
import { showAlerts } from "./alertsHandler";
export const signupForm = document.querySelector(".form--signup");
export const newUser = async function (e) {
  try {
    e.preventDefault();
    const fname = document.querySelector("#fname").value;
    const lname = document.querySelector("#lname").value;
    const email = document.querySelector("#email-signup").value;
    const password = document.querySelector("#password-signup").value;
    const passwordC = document.querySelector("#passwordConfirm-signup").value;
    // console.log({
    //   firstName: fname,
    //   lastName: lname,
    //   email: email,
    //   password: password,
    //   passwordConfirm: passwordC,
    // });
    const result = await axios({
      method: "POST",
      url: "/trevell/api/v1/users",
      data: {
        firstName: fname,
        lastName: lname,
        email: email,
        password: password,
        passwordConfirm: passwordC,
      },
    });
    // console.log(result);
    if (result.data.message === "Success") {
      showAlerts("success", "Signed in!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
      // alert("User logged in successfully");
      // window.setTimeout(() => {
      //   location.assign("/");
      // }, 1500);
    }
    // console.log({
    //   fname,
    //   lname,
    //   email,
    //   password,
    //   passwordC,
    // });
  } catch (err) {
    showAlerts("error", e.response.data.message);
  }
};
