import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import User from '@/app/model/userModel';
import { hashPassword } from '@/utils/password';



export default async function register (req:NextRequest) {
  const {firstName, lastName, username, email, password} = await req.json();
  const user = await User.findOne({email});
  if (user) {
    return NextResponse.json({message: 'User already exists'}, {status: 409});
  }
   const hashedPassword = hashPassword(password)
 
  const newUser = new User({firstName, lastName, username, email, password: hashedPassword});
  newUser.save();
  return NextResponse.json({message: 'User registered successfully'}, {status: 200});
}
