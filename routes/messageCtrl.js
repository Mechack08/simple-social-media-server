const models = require("../models");
const asyncLib = require("async");
const jwtUtils = require("../utils/jwt.utils");

module.exports = {
  createMessage: (req, res) => {
    //Getting auth header
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);

    const { title, message } = req.body;

    if (title == null || message == null) {
      return res.status(500).json({ error: "missing parameters" });
    }

    if (title.length < 2 || message.length < 4) {
      return res.status(500).json({ error: "ivalid parameters" });
    }

    asyncLib.waterfall(
      [
        (done) => {
          models.User.findOne({
            where: { id: userId },
          })
            .then((user) => {
              done(null, user);
              //console.log(user);
            })
            .catch((err) => {
              return res.status(500).json({ error: "enable to verify user" });
            });
        },
        (user, done) => {
          if (user) {
            models.Message.create({
              title: title,
              content: message,
              likes: 0,
              UserId: user.dataValues.id,
            })
              .then((newMessage) => {
                done(newMessage);
              })
              .catch((err) => {
                res.status(400).json({ error: "failed to create new message" });
              });
          } else {
            res.status(404).json({ error: "user not found" });
          }
        },
      ],
      (newMessage) => {
        if (newMessage) {
          return res.status(201).json(newMessage);
        } else return res.status(500).json({ error: "cannot post message" });
      }
    );
  },
  listMessage: (req, res) => {
    const fields = req.query.fields;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    const order = req.query.order;

    models.Message.findAll({
      order: [order != null ? order.split(":") : ["title", "ASC"]],
      attributes: fields !== "*" && fields != null ? fields.split(",") : null,
      limit: !isNaN(limit) ? limit : null,
      offset: !isNaN(offset) ? offset : null,
      include: [
        {
          model: models.User,
          attributes: ["username"],
        },
      ],
    })
      .then((messages) => {
        if (messages) return res.status(201).json(messages);
        else return res.status(404).json({ error: "messages not found" });
      })
      .catch((err) => {
        return res.status(500).json({ error: "ivalid fields" });
      });
  },
};
