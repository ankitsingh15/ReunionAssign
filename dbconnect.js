const mongoose = require("mongoose");
const MONGO_URL = process.env.MONGO_URL;
module.exports = async () => {
  const mongoUrl = process.env.MONGO_URL;

  try {
    mongoose.connect(
      mongoUrl,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      () => {
        console.log("MOngoDb connected");
      }
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
