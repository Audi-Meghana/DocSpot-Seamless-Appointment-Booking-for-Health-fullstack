const mongoose = require('mongoose');

const connectToDB = () => {
  console.log("🔍 Connecting to:", process.env.MONGO_URL); // Debug

  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((err) => {
      console.error(`❌ Could not connect to MongoDB:\n${err}`);
      process.exit(1);
    });
};

module.exports = connectToDB;
