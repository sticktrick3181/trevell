import { showAlerts } from "./alertsHandler";
import axios from "axios";
export const updatingPasswordForm = document.getElementById(
  "updating--password--form"
);
export const updationFrom = document.querySelector(".form-user-data");
export const updationFuntionality = async function (e) {
  try {
    // console.log("done");
    e.preventDefault();
    const form = new FormData();
    // const name = document.getElementById("name").value;
    // console.log(name);
    form.append(
      "firstName",
      document.getElementById("name").value.split(" ")[0]
    );
    form.append(
      "lastName",
      document.getElementById("name").value.split(" ")[1]
    );
    // const [firstName, lastName] = name.split(" ");
    // const email = document.getElementById("email").value;
    form.append("email", document.getElementById("email").value);
    if (document.getElementById("photo").files) {
      form.append("photo", document.getElementById("photo").files[0]);
    }
    console.log("Current user photo");
    // console.log(form);
    //selecting files usging dom
    // const photo = document.getElementById("photo").files[0];
    const newUser = await axios({
      method: "PATCH",
      url: "http://localhost:3000/trevell/api/v1/users/updateUserInfo",
      data: form,
    });
    console.log("Updated one");
    console.log(newUser);
    if (newUser.data.status === "Success") {
      showAlerts("success", "updated successfully");
      window.setTimeout(() => {
        location.assign("/user/me");
      }, 1500);
      // alert("User logged in successfully");
      // window.setTimeout(() => {
      //   location.assign("/");
      // }, 1500);
    }
  } catch (err) {
    showAlerts("success", "Reload for the applied changes");
    console.log(err);
  }
};
export const updatePasswordFunctionality = async function (e) {
  e.preventDefault();
  try {
    console.log("pressed");
    //   console.log("done");

    const existingPassword = document.getElementById("password-current").value;
    console.log(existingPassword);
    const newPassword = document.getElementById("password").value;
    console.log(newPassword);
    const confirmPassword = document.getElementById("password-confirm").value;
    console.log(confirmPassword);
    console.log({ newPassword, confirmPassword, existingPassword });
    const result = await axios({
      method: "PATCH",
      url: "http://localhost:3000/trevell/api/v1/users/updatePassword",
      data: {
        newPassword,
        confirmPassword,
        existingPassword,
      },
    });
    console.log(result);
    if (result.data.status === "Success") {
      showAlerts("success", "Password updated successfully");
      window.setTimeout(() => {
        location.assign("/user/login");
      }, 1500);
    }
  } catch (err) {
    showAlerts("error", err.response.data.message);
  }
};
// updationFrom.addEventListener("submit", updationFuntionality);
