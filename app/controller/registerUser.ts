import bcrypt from 'bcrypt'; 
import { Router } from 'express';
import User from '@/app/model/userModel';
import { hashPassword } from '@/utils/password';

const router = Router();

router.post('/register', async (req, res) => {
  const {firstName, lastName, username, email, password} = req.body;
  const user = await User.findOne({email});
  if (user) {
    return res.status(409).json({message: 'User already exists'});
  }
   const hashedPassword = hashPassword(password)
 
  const newUser = new User({firstName, lastName, username, email, password: hashedPassword});
  newUser.save();
  res.json({message: 'User registered successfully'});
});

export default router;
