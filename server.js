const express = require("express");

server = express();

server.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send("<h1>Bonjour mon server</h1>");
});

server.listen(8080, () => {
  console.log("Server en ecoute :) ");
});
