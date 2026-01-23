import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  sessionSecret: process.env.SESSION_SECRET,
  googleBooksApiKey: process.env.GOOGLE_BOOKS_API_KEY,
  env: process.env.NODE_ENV || 'development',
};


