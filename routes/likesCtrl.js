const models = require("../models");
const jwtUtils = require("../utils/jwt.utils");
const asyncLib = require("async");

module.exports = {
  likePost: (req, res) => {
    //Getting auth header
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    const messageId = parseInt(req.params.messageId);

    if (messageId <= 0)
      return res.status(400).json({ error: "invalide parameters" });

    asyncLib.waterfall(
      [
        (done) => {
          models.Message.findOne({
            attributes: { exclude: ["UserId", "messageId"] },
            where: { id: messageId },
          })
            .then((message) => done(null, message))
            .catch((err) => {
              return res
                .status(500)
                .json({ error: "unable to verify message" });
            });
        },
        (message, done) => {
          models.User.findOne({
            attributes: { exclude: ["userId"] },
            where: { id: userId },
          })
            .then((user) => done(null, message, user))
            .catch((err) => {
              return res.status(500).json({ error: "unable to verify user" });
            });
        },
        (message, user, done) => {
          if (user) {
            models.Like.findOne({
              where: {
                userId: userId,
                messageId: messageId,
              },
            })
              .then((isUserAlreadyLiked) =>
                done(null, message, user, isUserAlreadyLiked)
              )
              .catch((err) => {
                return res
                  .status(500)
                  .json({ error: "unable to verify is user already liked" });
              });
          } else res.status(404).json({ error: "user not exist" });
        },
        (message, user, isUserAlreadyLiked, done) => {
          if (!isUserAlreadyLiked) {
            message
              .addUser(user)
              .then((alreadyLikeFound) => {
                done(null, message, user, isUserAlreadyLiked);
              })
              .catch((err) => {
                return res
                  .status(500)
                  .json({ error: "unable to set user reaction" });
              });
          } else return res.status(409).json({ error: "user already liked" });
        },
        (message, user, done) => {
          message
            .update({
              likes: message.likes + 1,
            })
            .then(() => done(message))
            .catch((err) =>
              res
                .status(500)
                .json({ error: "cannot update message like counter" })
            );
        },
      ],
      (message) => {
        if (message) return res.status(201).json(message);
        else return res.status(500).json({ error: "cannot update message" });
      }
    );
  },
  disLikePost: (req, res) => {
    // Getting auth header
    var headerAuth = req.headers["authorization"];
    var userId = jwtUtils.getUserId(headerAuth);

    // Params
    var messageId = parseInt(req.params.messageId);

    if (messageId <= 0) {
      return res.status(400).json({ error: "invalid parameters" });
    }

    asyncLib.waterfall(
      [
        (done) => {
          models.Message.findOne({
            where: { id: messageId },
          })
            .then((messageFound) => {
              done(null, messageFound);
            })
            .catch((err) => {
              return res
                .status(500)
                .json({ error: "unable to verify message" });
            });
        },
        (messageFound, done) => {
          if (messageFound) {
            models.User.findOne({
              where: { id: userId },
            })
              .then((userFound) => {
                done(null, messageFound, userFound);
              })
              .catch((err) => {
                return res.status(500).json({ error: "unable to verify user" });
              });
          } else {
            res.status(404).json({ error: "post already liked" });
          }
        },
        (messageFound, userFound, done) => {
          if (userFound) {
            models.Like.findOne({
              where: {
                userId: userId,
                messageId: messageId,
              },
            })
              .then((userAlreadyLikedFound) => {
                done(null, messageFound, userFound, userAlreadyLikedFound);
              })
              .catch((err) => {
                return res
                  .status(500)
                  .json({ error: "unable to verify is user already liked" });
              });
          } else {
            res.status(404).json({ error: "user not exist" });
          }
        },
        (messageFound, userFound, userAlreadyLikedFound, done) => {
          if (!userAlreadyLikedFound) {
            messageFound
              .addUser(userFound, { isLike: DISLIKED })
              .then((alreadyLikeFound) => {
                done(null, messageFound, userFound);
              })
              .catch((err) => {
                return res
                  .status(500)
                  .json({ error: "unable to set user reaction" });
              });
          } else {
            if (userAlreadyLikedFound.isLike === LIKED) {
              userAlreadyLikedFound
                .update({
                  isLike: DISLIKED,
                })
                .then(() => {
                  done(null, messageFound, userFound);
                })
                .catch((err) => {
                  res
                    .status(500)
                    .json({ error: "cannot update user reaction" });
                });
            } else {
              res.status(409).json({ error: "message already disliked" });
            }
          }
        },
        (messageFound, userFound, done) => {
          messageFound
            .update({
              likes: messageFound.likes - 1,
            })
            .then(() => {
              done(messageFound);
            })
            .catch((err) => {
              res
                .status(500)
                .json({ error: "cannot update message like counter" });
            });
        },
      ],
      (messageFound) => {
        if (messageFound) {
          return res.status(201).json(messageFound);
        } else {
          return res.status(500).json({ error: "cannot update message" });
        }
      }
    );
  },
};
