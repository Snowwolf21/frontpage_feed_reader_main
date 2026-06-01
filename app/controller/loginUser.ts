import { NextResponse, NextRequest} from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../model/userModel';
import { comparePassword } from '@/utils/password';
// import { sendEmail } from '@/utils/sendEmail';



export default async function login(req:NextRequest) {
 try {
    const {email, password} = await req.json();
  const user = await User.findOne({email});
  if (!user) {
    return NextResponse.json({message: 'User not found'}, {status: 404});
  }
  const isPasswordValid = comparePassword(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json({message: 'Invalid password'}, {status: 401});
  }
  const jwt_secret = process.env.JWT_SECRET;
  if(!jwt_secret) {
    return NextResponse.json({message: 'Server error'}, {status: 500});
  }
  const token = jwt.sign({
    id: user._id,
    email: user.email,
  },
     jwt_secret, {expiresIn: '1h'});

      const response = NextResponse.json({message: 'Login successful'}, {status: 200});
     response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600,
        path: '/',
     })
     return response;
 } catch (error) {
  console.log(error);
  return NextResponse.json({message: 'Internal server error'}, {status: 500});
 }
}

 

