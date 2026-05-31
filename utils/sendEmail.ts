import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
    });
};