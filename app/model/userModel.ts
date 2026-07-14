import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: function (this: { oauthProvider?: string }) {
        return !this.oauthProvider;
      },
    },
    lastName: {
      type: String,
      required: function (this: { oauthProvider?: string }) {
        return !this.oauthProvider;
      },
    },
    username: {
      type: String,
      required: function (this: { oauthProvider?: string }) {
        return !this.oauthProvider;
      },
      unique: true,
      sparse: true, // allows multiple null values (OAuth users may not have a username yet)
      minLength: 3,
      maxLength: 15,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function (this: { oauthProvider?: string }) {
        return !this.oauthProvider;
      },
    },
    // OAuth fields — optional for credential users
    oauthProvider: {
      type: String,
      enum: ["google", "github", "linkedin"],
    },
    oauthId: {
      type: String,
      index: true,
    },
    avatarUrl: {
      type: String,
    },
    // Password reset — one-time token (stored as SHA-256 hash)
    passwordResetToken: {
      type: String,
      select: false, // never returned in queries by default
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Compound index so OAuth lookups are fast
userSchema.index({ oauthProvider: 1, oauthId: 1 }, { sparse: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

// Helper: generate a random reset token and its DB-safe hash
export function generatePasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}