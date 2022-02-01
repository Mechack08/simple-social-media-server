const bcrypt = require("bcrypt");
const models = require("../models");
const jwtUtils = require("../utils/jwt.utils");
const asyncLib = require("async");

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{8,15}$/;

module.exports = {
  register: (req, res) => {
    const { email, username, password, bio } = req.body;

    if (email == null || username == null || password == null) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    //TODO Verify pseudo length, mail regex, password, etc.
    if (username.length <= 3 || username.length >= 13)
      return res
        .status(400)
        .json({ error: "wrong username (must be length 4 - 12)" });

    if (!EMAIL_REGEX.test(email))
      return res.status(400).json({ error: "email is not valid" });

    if (!PASSWORD_REGEX.test(password))
      return res.status(400).json({
        error:
          "invalid password (must length 8 - 15 and include at least 1 letter",
      });

    //Async WaterFall
    asyncLib.waterfall(
      [
        (done) => {
          models.User.findOne({
            attributes: ["emai"],
            where: { emai: email },
          })
            .then((user) => done(null, user))
            .catch((err) => {
              return res.status(500).json({ error: "enable to verify user " });
            });
        },
        (user, done) => {
          if (!user) {
            bcrypt.hash(password, 5, function (err, hashedPwd) {
              done(null, user, hashedPwd);
            });
          } else return res.status(409).json({ error: "user already exist" });
        },
        (user, hashedPwd, done) => {
          models.User.create({
            emai: email,
            username: username,
            password: hashedPwd,
            bio: bio,
            isAdmin: 0,
          })
            .then((newUser) => {
              done(newUser);
            })
            .catch((err) => {
              return res.status(500).json({ error: "cannot add user " + err });
            });
        },
      ],
      (newUser) => {
        if (newUser) return res.status(201).json({ userId: newUser.id });
        else return res.status(404).json({ error: "cannot add user" });
      }
    );

    /* models.User.findOne({
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
      }); */
  },
  login: (req, res) => {
    const { email, password } = req.body;

    if (email == null || password == null) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    //TODO Verify pseudo length, mail regex, password, etc.

    //Waterfall Login
    asyncLib.waterfall(
      [
        function (done) {
          models.User.findOne({
            where: { emai: email },
          })
            .then(function (userFound) {
              done(null, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "unable to verify user" });
            });
        },
        function (userFound, done) {
          if (userFound) {
            bcrypt.compare(
              password,
              userFound.password,
              function (errBycrypt, resBycrypt) {
                done(null, userFound, resBycrypt);
              }
            );
          } else {
            return res.status(404).json({ error: "user not exist in DB" });
          }
        },
        function (userFound, resBycrypt, done) {
          if (resBycrypt) {
            done(userFound);
          } else {
            return res.status(403).json({ error: "invalid password" });
          }
        },
      ],
      function (userFound) {
        if (userFound) {
          return res.status(201).json({
            userId: userFound.id,
            token: jwtUtils.generateTokenForUser(userFound),
          });
        } else {
          return res.status(500).json({ error: "cannot log on user" });
        }
      }
    );

    /* models.User.findOne({
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
      }); */
  },
  getUserProfile: (req, res) => {
    //Getting auth header
    const headerAuth = req.headers["authorization"];
    const userId = jwtUtils.getUserId(headerAuth);
    console.log(headerAuth);

    if (userId < 0) return res.status(400).json({ error: "wrong token" });

    models.User.findOne({
      attributes: ["id", "emai", "username", "bio"],
      where: { id: userId },
    })
      .then((user) => {
        if (user) {
          return res.status(200).json(user);
        } else return res.status(404).json({ error: "user not found" });
      })
      .catch((err) => {
        return res.status(500).json({ error: "cannot fetch user data" });
      });
  },
};
