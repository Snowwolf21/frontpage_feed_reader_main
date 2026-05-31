import express from 'express';
import register from '@/app/controller/registerUser';
import login from '@/app/controller/loginUser';
import logout from '@/app/controller/logOutuser';
import cookieParser from 'cookie-parser';
import forgotPassword from '@/app/controller/forgot-password';
import resetPassword from '@/app/controller/reset-password';
import dotenv from 'dotenv';
import connectDB from '@/app/config/db';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/api/auth', register);
app.use('/api/auth', login);
app.use('/api/auth', logout);
app.use('/api/auth', forgotPassword);
app.use('/api/auth', resetPassword);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
}).catch((error) => {
  console.error('Failed to connect to MongoDB', error);
  process.exit(1);
});
