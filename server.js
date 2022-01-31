const express = require("express");
const bodyParser = require("body-parser");
const apiRouter = require("./apiRouter").router;

server = express();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send("<h1>Bonjour mon server</h1>");
});

server.use("/api/", apiRouter);

server.listen(8080, () => {
  console.log("Server en ecoute :) ");
});
