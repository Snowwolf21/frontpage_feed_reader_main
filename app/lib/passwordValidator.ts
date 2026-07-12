import zxcvbn from 'zxcvbn';

const STRONG_PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

const COMMON_PASSWORDS = [
  'password', '123456', 'qwerty', 'abc123', 'password123',
  '12345678', 'letmein', 'welcome', 'monkey', 'dragon',
  'master', 'sunshine', 'princess', 'football', 'shadow',
  'michael', 'superman', 'batman', 'starwars', 'hello123'
];

export interface PasswordStrengthResult {
  isStrong: boolean;
  score: number; // 0-4 (0=very weak, 4=very strong)
  feedback: string[];
  timeToGuess: string; // Human readable time estimate
}

/**
 * Validate password strength using multiple criteria
 * @param password - Password to validate
 * @returns PasswordStrengthResult with detailed feedback
 */

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < STRONG_PASSWORD_REQUIREMENTS.minLength) {
    feedback.push(
      `Password must be at least ${STRONG_PASSWORD_REQUIREMENTS.minLength} characters long (current: ${password.length})`
    );
  } else {
    score++;
  }

  // Check for uppercase letters
  if (!STRONG_PASSWORD_REQUIREMENTS.requireUppercase || !/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score++;
  }

  // Check for lowercase letters
  if (!STRONG_PASSWORD_REQUIREMENTS.requireLowercase || !/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score++;
  }

  // Check for numbers
  if (!STRONG_PASSWORD_REQUIREMENTS.requireNumbers || !/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score++;
  }

  // Check for special characters
  if (!STRONG_PASSWORD_REQUIREMENTS.requireSpecialChars || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Password must contain at least one special character (!@#$%^&*)');
  } else {
    score++;
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.some(common => password.toLowerCase().includes(common))) {
    feedback.push('Password is too common. Avoid using well-known passwords or phrases');
    score = Math.max(0, score - 1);
  }

  // Use zxcvbn for advanced entropy analysis
  const zxcvbnResult = zxcvbn(password);
  const timeToGuess = estimateGuessTime(
  zxcvbnResult.crack_times_seconds.online_no_throttling_10_per_second as number
);


  // Adjust score based on zxcvbn analysis
  const zxcvbnScore = zxcvbnResult.score;
  const finalScore = Math.max(0, Math.min(4, Math.floor((score + zxcvbnScore) / 2)));

  // Add zxcvbn feedback if available
  if (zxcvbnResult.feedback.warning) {
    feedback.push(zxcvbnResult.feedback.warning);
  }

  return {
    isStrong: finalScore >= 3 && feedback.length === 0,
    score: finalScore,
    feedback,
    timeToGuess,
  };
}

/**
 * Convert seconds to human-readable time estimate
 */
function estimateGuessTime(seconds: number): string {
  if (seconds < 1) return 'less than a second';
  if (seconds < 60) return 'seconds';
  if (seconds < 3600) return 'minutes';
  if (seconds < 86400) return 'hours';
  if (seconds < 604800) return 'days';
  if (seconds < 2592000) return 'weeks';
  if (seconds < 31536000) return 'months';
  return 'years';
}

/**
 * Generate password strength meter description
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Strong';
    case 4:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
}

/**
 * Get color for password strength meter
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-yellow-500';
    case 3:
      return 'bg-blue-500';
    case 4:
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}
