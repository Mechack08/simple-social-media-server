const express = require("express");
const usersCtrl = require("./routes/usersCtrl");
const messagesCtrl = require("./routes/messageCtrl");
const likesCtrl = require("./routes/likesCtrl");

//Router
exports.router = (() => {
  const apiRouter = express.Router();

  //Users Routes
  apiRouter.route("/users/register/").post(usersCtrl.register);
  apiRouter.route("/users/login/").post(usersCtrl.login);
  apiRouter.route("/users/me/").get(usersCtrl.getUserProfile);
  apiRouter.route("/users/me/").put(usersCtrl.updateUserProfile);

  //Messages Routes
  apiRouter.route("/messages/new/").post(messagesCtrl.createMessage);
  apiRouter.route("/messages/").get(messagesCtrl.listMessage);

  //Like and Dislike Routes
  apiRouter.route("/messages/:messageId/vote/like").post(likesCtrl.likePost);
  apiRouter
    .route("/messages/:messageId/vote/dislike")
    .post(likesCtrl.disLikePost);

  return apiRouter;
})();
