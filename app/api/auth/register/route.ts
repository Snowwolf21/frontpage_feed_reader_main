import { NextRequest, NextResponse } from "next/server";
import User from "@/app/model/userModel";
import connectDB from "@/app/config/db";
import { hashPassword } from "@/utils/password";

import { registerLimiter } from "@/app/lib/rateLimiter";
import { createIdentifier } from "@/app/lib/rateLimiter/utils";

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const identifier = createIdentifier("register", req);

    const { success } = await registerLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          message:
            "Too many registration attempts. Please try again later.",
        },
        {
          status: 429,
        }
      );
    }

    // Parse request body
    const body = await req.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        {
          message: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      firstName,
      lastName,
      username,
      email,
      password,
    } = body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          message: "All fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Normalize values
    const normalizedFirstName = String(firstName).trim();
    const normalizedLastName = String(lastName).trim();
    const normalizedUsername = String(username).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    // Empty string check after trimming
    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !normalizedUsername ||
      !normalizedEmail
    ) {
      return NextResponse.json(
        {
          message: "All fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          message: "Invalid email address.",
        },
        {
          status: 400,
        }
      );
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!usernameRegex.test(normalizedUsername)) {
      return NextResponse.json(
        {
          message:
            "Username may only contain letters, numbers and underscores.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      normalizedUsername.length < 3 ||
      normalizedUsername.length > 15
    ) {
      return NextResponse.json(
        {
          message:
            "Username must be between 3 and 15 characters.",
        },
        {
          status: 400,
        }
      );
    }

    // Password validation
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

    if (!strongPassword.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password must be 8-64 characters long and include at least one uppercase letter, one lowercase letter, and one number.",
        },
        {
          status: 400,
        }
      );
    }

    // Connect to database only after validation
    await connectDB();

    // Check existing user concurrently
    const [existingEmail, existingUsername] =
      await Promise.all([
        User.findOne({
          email: normalizedEmail,
        }).lean(),

        User.findOne({
          username: normalizedUsername,
        }).lean(),
      ]);

    if (existingEmail || existingUsername) {
      return NextResponse.json(
        {
          message: "Account already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    await User.create({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "User registered successfully.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        message: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}