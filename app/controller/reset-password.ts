import { Router } from 'express';
import User from '../model/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { sendEmail } from '@/utils/sendEmail';

dotenv.config();
const router = Router();

router.post('/reset-password', async (req, res) => {
    try {
        const {token, password} = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {id: string};
        if (!decoded) {
            return res.status(404).json({message: 'User not found'});
        }
        const user = await User.findOne({_id: decoded.id});
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        user.password = await bcrypt.hash(password, 10);
        await user.save();
        sendEmail(user.email, 'Password reset successful', 'Your password has been reset successfully', `
          <h1>Password Reset Successful</h1>
          <p>Your password has been reset successfully</p>
          <a href="${process.env.FRONTEND_URL}/login">Login</a>
        `);  
        return res.json({message: 'Password reset successful'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
});

export default router;