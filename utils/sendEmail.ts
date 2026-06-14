import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const fromName = process.env.EMAIL_FROM_NAME || 'Frontpage';

    if (!emailUser || !emailPass) {
        throw new Error('Missing Nodemailer credentials. Set EMAIL_USER and EMAIL_PASS in your environment.');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });

    await transporter.sendMail({
        from: `"${fromName}" <${emailUser}>`,
        to,
        subject,
        text,
        html,
    });
};
