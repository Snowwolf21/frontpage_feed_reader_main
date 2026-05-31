
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import User from '../model/userModel';
import { sendEmail } from '@/utils/sendEmail';
import { comparePassword } from '@/utils/password';

const router = Router();

router.post('/login', async (req, res) => {
 try {
    const {email, password} = req.body;
  const user = await User.findOne({email});
  if (!user) {
    return res.status(404).json({message: 'User not found'});
  }
  const isPasswordValid = comparePassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({message: 'Invalid password'});
  }
  const jwt_secret = process.env.JWT_SECRET;
  if(!jwt_secret) {
    return res.status(500).json({message: 'Server error'});
  }
  const token = jwt.sign({
    id: user._id,
    email: user.email,
  },
     jwt_secret, {expiresIn: '1h'});
     res.cookie("token", token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       maxAge: 1000 * 60 * 60 * 24 * 7,
     })
     sendEmail(user.email, 'Login successful', 'You have been logged in successfully', `
       <h1>Login Successful</h1>
       <p>You have been logged in successfully</p>
     `);  
  return res.json({message: 'Login successful'});
 } catch (error) {
  console.log(error);
  return res.status(500).json({message: 'Internal server error'});
 }
});


export default router;  

