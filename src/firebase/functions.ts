'use server';
/**
 * @fileOverview Cloud Functions for Firebase
 *
 * This file exports the Cloud Functions that provide backend functionality
 * for the ResolveX application, such as sending OTPs for signup.
 */

import {https, HttpsError} from 'firebase-functions';
import *dmin from 'firebase-admin';
import {getFirestore, Timestamp} from 'firebase-admin/firestore';

// You will need to initialize the admin SDK.
// It's recommended to do this once, for example, in a separate config file.
// For this example, we'll initialize it here.
admin.initializeApp();

const db = getFirestore();

/**
 * Generates a random 6-digit numeric string.
 */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * A Cloud Function to send a One-Time Password (OTP) for user signup.
 * - It checks for rate limits (max 3 OTPs per hour per email).
 * - Generates a 6-digit OTP.
 * - Stores the OTP in Firestore with a 5-minute expiration.
 * - Sends the OTP via email (using a placeholder for the email service).
 */
export const sendSignupOtp = https.onCall(async (data, context) => {
    const email = data.email;

    if (!email || typeof email !== 'string') {
        throw new HttpsError('invalid-argument', 'The function must be called with a valid "email" argument.');
    }

    const otpCollection = db.collection('signupOtps');
    const now = Timestamp.now();
    const oneHourAgo = new Timestamp(now.seconds - 3600, now.nanoseconds);

    // Check rate limit: max 3 requests per hour per email
    const recentOtps = await otpCollection
        .where('email', '==', email)
        .where('createdAt', '>=', oneHourAgo)
        .get();

    if (recentOtps.docs.length >= 3) {
        throw new HttpsError('resource-exhausted', 'Too many OTP requests. Please try again later.');
    }

    const otp = generateOtp();
    const expiresAt = new Timestamp(now.seconds + 300, now.nanoseconds); // 5 minutes expiry

    const otpDoc = {
        email,
        code: otp,
        createdAt: now,
        expiresAt,
    };

    // Store the OTP document
    await otpCollection.add(otpDoc);

    // --- TODO: Integrate your transactional email service (e.g., SendGrid) here ---
    // This is a placeholder for the email sending logic.
    console.log(`Sending OTP to ${email}: ${otp}`);
    // Example with a generic email sending function:
    // await sendEmail({
    //   to: email,
    //   subject: 'Your ResolveX Verification Code',
    //   text: `Your verification code is: ${otp}. It will expire in 5 minutes.`,
    //   html: `<p>Your verification code is: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
    // });
    // --------------------------------------------------------------------------------

    return { success: true, message: 'OTP sent successfully.' };
});


/**
 * A Cloud Function to verify a signup OTP.
 * - Checks if the provided OTP matches the one stored in Firestore.
 * - Ensures the OTP is not expired.
 * - Deletes the OTP document after successful verification.
 */
export const verifySignupOtp = https.onCall(async (data, context) => {
    const { email, code } = data;

    if (!email || !code) {
        throw new HttpsError('invalid-argument', 'The function must be called with "email" and "code" arguments.');
    }

    const otpQuery = db.collection('signupOtps')
        .where('email', '==', email)
        .where('code', '==', code)
        .orderBy('createdAt', 'desc')
        .limit(1);

    const snapshot = await otpQuery.get();

    if (snapshot.empty) {
        throw new HttpsError('not-found', 'Invalid OTP. Please check the code and try again.');
    }

    const otpDoc = snapshot.docs[0];
    const otpData = otpDoc.data();
    const now = Timestamp.now();

    if (now > otpData.expiresAt) {
        throw new HttpsError('deadline-exceeded', 'The OTP has expired. Please request a new one.');
    }

    // OTP is valid, delete it so it can't be reused
    await otpDoc.ref.delete();

    return { success: true, message: 'OTP verified successfully.' };
});
