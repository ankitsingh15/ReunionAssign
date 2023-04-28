const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config("./.env");
const dbconnect = require("./dbconnect");
const authController = require("./routers/authRouter");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

//middlewares
app.use(express.json({ limit: "10mb" }));

//morgan is use to get api hit description on terminal
app.use(morgan("common"));
app.use(cookieParser());

app.use("/api", authController);

app.get("/fetch", (req, res) => {
  res.status(200).send("Ok from Server");
});

dbconnect();

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log("Listening On port", PORT);
});

module.exports = app;
