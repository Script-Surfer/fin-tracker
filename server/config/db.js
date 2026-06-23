const mongoose = require('mongoose');

const connectDB = async () => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 3000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;                       // success – stop retrying
    } catch (error) {
      console.error(
        `DB connection error (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`
      );

      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s…`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        console.error('All DB connection attempts failed. Exiting.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;