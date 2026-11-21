/**
 * Generates a cryptographically randomized 4-digit numeric OTP
 * for physical verification during food collection (donor -> volunteer)
 * and final delivery (volunteer -> receiver).
 */
export function generateHandoffOtp(): string {
  // Generate a random number between 1000 and 9999
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
}

/**
 * Validates whether the submitted OTP matches the expected order OTP.
 */
export function verifyHandoffOtp(submittedOtp: string, expectedOtp: string): boolean {
  if (!submittedOtp || !expectedOtp) return false;
  return submittedOtp.trim() === expectedOtp.trim();
}
