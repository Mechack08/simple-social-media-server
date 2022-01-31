const bcrypt = require("bcrypt");
const models = require("../models");
const jwtUtils = require("../utils/jwt.utils");

module.exports = {
  register: (req, res) => {
    const { email, username, password, bio } = req.body;

    if (email == null || username == null || password == null) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    //TODO Verify pseudo length, mail regex, password, etc.
    models.User.findOne({
      attributes: ["emai"],
      where: { emai: email },
    })
      .then((user) => {
        if (!user) {
          bcrypt.hash(password, 5, function (err, hashedPwd) {
            models.User.create({
              emai: email,
              username: username,
              password: hashedPwd,
              bio: bio,
              isAdmin: 0,
            })
              .then((newUser) => {
                return res.status(201).json({ userId: newUser.id });
              })
              .catch((err) => {
                return res
                  .status(500)
                  .json({ error: "cannot add user " + err });
              });
          });
        } else {
          return res.status(409).json({ error: "user already exist" });
        }
      })
      .catch((error) => {
        return res
          .status(500)
          .json({ error: "enable to verify user " + error });
      });
  },
  login: (req, res) => {
    const { email, password } = req.body;

    if (email == null || password == null) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    //TODO Verify pseudo length, mail regex, password, etc.
    models.User.findOne({
      where: { emai: email },
    })
      .then((user) => {
        if (user) {
          bcrypt.compare(password, user.password, (e, response) => {
            if (response) {
              return res.status(200).json({
                userId: user.id,
                token: jwtUtils.generateTokenForUser(user),
              });
            } else {
              return res.status(401).json({ error: "user password incorrect" });
            }
          });
        } else {
          return res.status(404).json({ error: "user do not exist in db" });
        }
      })
      .catch((err) => {
        return res.status(500).json({ error: "enable to verify user " });
      });
  },
};
