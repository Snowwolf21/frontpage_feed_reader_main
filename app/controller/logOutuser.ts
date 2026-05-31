
import { Router } from 'express';

const router = Router();

router.post('/logout', async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict'
        });
        res.json({message: 'Logout successful'});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
    }
});


export default router;