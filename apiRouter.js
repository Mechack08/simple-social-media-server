const express = require("express");
const usersCtrl = require("./routes/usersCtrl");

//Router
exports.router = (() => {
  const apiRouter = express.Router();

  //Users Routes
  apiRouter.route("/users/register/").post(usersCtrl.register);
  apiRouter.route("/users/login/").post(usersCtrl.login);
  apiRouter.route("/users/me/").get(usersCtrl.getUserProfile);
  apiRouter.route("/users/me/").put(usersCtrl.updateUserProfile);

  return apiRouter;
})();
