const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const routes = require("./Routes/TodoRoute");
const PORT = process.env.port || 8000;
app.use(express.json());
app.use(cors());
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("connected to MongoDb");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(routes);
app.listen(PORT, () => {
  console.log(`Listening on : ${PORT}`);
});
