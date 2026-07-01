"use client";

import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from "@/app/lib/passwordValidator";
import { AlertCircle, CheckCircle } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  showFeedback?: boolean;
}

export default function PasswordStrengthMeter({ password, showFeedback = true }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const strengthResult = validatePasswordStrength(password);

  const strengthColor = getPasswordStrengthColor(strengthResult.score);
  const strengthLabel = getPasswordStrengthLabel(strengthResult.score);

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-400">Password Strength</label>
          <span className={`text-xs font-bold ${strengthResult.score >= 3 ? 'text-green-500' : 'text-orange-500'}`}>
            {strengthLabel}
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${strengthColor} transition-all duration-300`}
            style={{ width: `${(strengthResult.score / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Time to Guess */}
      {strengthResult.timeToGuess && (
        <p className="text-xs text-zinc-400">
          Time to guess: <span className="font-semibold text-zinc-300">{strengthResult.timeToGuess}</span>
        </p>
      )}

      {/* Feedback */}
      {showFeedback && strengthResult.feedback.length > 0 && (
        <div className="space-y-2">
          {strengthResult.feedback.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-400">{item}</p>
            </div>
          ))}
        </div>
      )}

      {/* Success Message */}
      {strengthResult.isStrong && (
        <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          <p className="text-xs font-medium text-green-400">Your password is strong and secure</p>
        </div>
      )}
    </div>
  );
}
