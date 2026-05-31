import { Router } from 'express';
import User from '../model/userModel';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { sendEmail } from '@/utils/sendEmail';

dotenv.config();
const router = Router();

router.post('/forgot-password', async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        const jwt_secret = process.env.JWT_SECRET;
        if(!jwt_secret) {
            return res.status(500).json({message: 'Server error'});
        }
        const token = jwt.sign({
            id: user._id,
            email: user.email,
        }, jwt_secret, {expiresIn: '1h'});
        sendEmail(user.email, 'Forgot Password', 'You have been sent this email because you requested to reset your password', `
          <h1>Forgot Password</h1>
          <p>You have been sent this email because you requested to reset your password</p>
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>
        `);  
        return res.json({message: 'Login successful'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
});

export default router;
