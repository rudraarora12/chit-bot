const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI || mongoURI.trim() === '') {
    console.warn(
      '\x1b[33m%s\x1b[0m',
      '[MongoDB Config Notice] MONGO_URI is empty in environment variables (.env).'
    );
    console.warn(
      '\x1b[33m%s\x1b[0m',
      '[MongoDB Config Notice] Database connection will remain uninitialized until MONGO_URI is configured. Server and API routes continue running cleanly.'
    );
    return false;
  }

  if (mongoURI.includes('<db_password>') || mongoURI.includes('<password>')) {
    console.warn(
      '\x1b[33m%s\x1b[0m',
      '[MongoDB Config Notice] MONGO_URI contains "<db_password>" placeholder in backend/.env.'
    );
    console.warn(
      '\x1b[33m%s\x1b[0m',
      '[MongoDB Config Notice] Replace "<db_password>" with your actual MongoDB Atlas password in backend/.env to connect. Server continues running cleanly.'
    );
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
