/**
 * @fileOverview Cloud Functions for Firebase
 *
 * This file exports the Cloud Functions that provide backend functionality
 * for the ResolveX application, such as sending OTPs for signup.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

/**
 * Generates a random 6-digit numeric string.
 */
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * A Cloud Function to send a One-Time Password (OTP) for user signup.
 */
exports.sendSignupOtp = functions.https.onCall(async (data, context) => {
  const email = data.email;

  if (!email || typeof email !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with a valid "email" argument.'
    );
  }

  const otpCollection = db.collection("signupOtps");
  const now = admin.firestore.Timestamp.now();
  const oneHourAgo = new admin.firestore.Timestamp(now.seconds - 3600, now.nanoseconds);

  // Check rate limit: max 3 requests per hour per email
  const recentOtps = await otpCollection
    .where("email", "==", email)
    .where("createdAt", ">=", oneHourAgo)
    .get();

  if (recentOtps.docs.length >= 3) {
    throw new functions.https.HttpsError(
      "resource-exhausted",
      "Too many OTP requests. Please try again later."
    );
  }

  const otp = generateOtp();
  const expiresAt = new admin.firestore.Timestamp(now.seconds + 300, now.nanoseconds); // 5 minutes expiry

  const otpDoc = {
    email,
    code: otp,
    createdAt: now,
    expiresAt,
  };

  await otpCollection.add(otpDoc);

  // --- TODO: Integrate your transactional email service (e.g., SendGrid) here ---
  // This is a placeholder for the email sending logic.
  // For now, we are just logging it to the console. In production, you'd use a service.
  console.log(`Sending OTP to ${email}: ${otp}`);
  // In a real app, you would have something like:
  // await sendEmailWithSendGrid({ to: email, from: 'no-reply@resolvex.com', subject: 'Your OTP', text: `Your code is ${otp}` });
  // --------------------------------------------------------------------------------

  return { success: true, message: "OTP sent successfully." };
});

/**
 * A Cloud Function to verify a signup OTP.
 */
exports.verifySignupOtp = functions.https.onCall(async (data, context) => {
  const { email, code } = data;

  if (!email || !code) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with "email" and "code" arguments.'
    );
  }

  const otpQuery = db
    .collection("signupOtps")
    .where("email", "==", email)
    .where("code", "==", code)
    .orderBy("createdAt", "desc")
    .limit(1);

  const snapshot = await otpQuery.get();

  if (snapshot.empty) {
    throw new functions.https.HttpsError(
      "not-found",
      "Invalid OTP. Please check the code and try again."
    );
  }

  const otpDoc = snapshot.docs[0];
  const otpData = otpDoc.data();
  const now = admin.firestore.Timestamp.now();

  if (now > otpData.expiresAt) {
    await otpDoc.ref.delete(); // Clean up expired OTP
    throw new functions.https.HttpsError(
      "deadline-exceeded",
      "The OTP has expired. Please request a new one."
    );
  }

  // OTP is valid, delete it so it can't be reused
  await otpDoc.ref.delete();

  return { success: true, message: "OTP verified successfully." };
});
