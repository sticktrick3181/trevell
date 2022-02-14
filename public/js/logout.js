const { default: axios } = require("axios");

const logoutBtn = document.querySelector(".nav__el--logout");
logoutBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const result = await axios({
    method: "GET",
    url: "/trevell/api/v1/users/logout",
  });
  // console.log(result);
});
