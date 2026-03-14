/**
 * EmailJS — Password Reset Email Service
 * -----------------------------------------------
 * OPTIONAL EmailJS setup (to send real emails):
 *  1. Go to https://www.emailjs.com — free account (200 emails/month)
 *  2. Add an Email Service (Gmail, Outlook, etc.) → note the SERVICE ID.
 *  3. Create a template with variables:
 *       {{to_email}}, {{to_name}}, {{reset_link}}, {{app_name}}, {{expiry}}
 *     → note the TEMPLATE ID.
 *  4. Account → API Keys → note your PUBLIC KEY.
 *  5. Replace the three values below.
 *
 * WITHOUT EmailJS configured, the app shows the secure reset link
 * directly on screen so the user can still reset their password.
 * -----------------------------------------------
 */

import emailjs from '@emailjs/browser';

// ── Replace with YOUR credentials to enable real email sending ──
const SERVICE_ID  = 'service_s6esyij';
const TEMPLATE_ID = 'template_ih0zgud';
const PUBLIC_KEY  = 'r45mdmXOXs-0CdBnf';
// ────────────────────────────────────────────────────────────────

/** Returns true when real EmailJS credentials have been filled in. */
export function isEmailConfigured() {
  return (
    SERVICE_ID  !== 'YOUR_SERVICE_ID'  &&
    TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
    PUBLIC_KEY  !== 'YOUR_PUBLIC_KEY'
  );
}

/** Builds the full reset URL for a given token. */
export function buildResetLink(token) {
  return `${window.location.origin}/reset-password?token=${token}`;
}

/** Generates a secure random hex token (32 chars). */
export function generateResetToken() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Saves a reset token to localStorage with a 30-minute expiry.
 * @param {string} email
 * @param {string} token
 */
export function saveResetToken(email, token) {
  const expiry = Date.now() + 30 * 60 * 1000;
  const pending = JSON.parse(localStorage.getItem('ri_reset_tokens') || '{}');
  pending[token] = { email: email.toLowerCase().trim(), expiry };
  localStorage.setItem('ri_reset_tokens', JSON.stringify(pending));
}

/**
 * Validates a token.
 * @returns {{ valid: true, email: string } | { valid: false, reason: string }}
 */
export function validateResetToken(token) {
  const pending = JSON.parse(localStorage.getItem('ri_reset_tokens') || '{}');
  const entry = pending[token];
  if (!entry) return { valid: false, reason: 'Invalid or already used reset link.' };
  if (Date.now() > entry.expiry) {
    delete pending[token];
    localStorage.setItem('ri_reset_tokens', JSON.stringify(pending));
    return { valid: false, reason: 'This reset link has expired. Please request a new one.' };
  }
  return { valid: true, email: entry.email };
}

/** Deletes a token after it has been used. */
export function consumeResetToken(token) {
  const pending = JSON.parse(localStorage.getItem('ri_reset_tokens') || '{}');
  delete pending[token];
  localStorage.setItem('ri_reset_tokens', JSON.stringify(pending));
}

/**
 * Sends a password-reset email via EmailJS.
 * Only call this if isEmailConfigured() returns true.
 * @param {string} toEmail
 * @param {string} toName
 * @param {string} token
 */
export async function sendResetEmail(toEmail, toName, token) {
  const resetLink = buildResetLink(token);
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email:   toEmail,
      to_name:    toName || toEmail.split('@')[0],
      reset_link: resetLink,
      app_name:   'RI Factory Management',
      expiry:     '30 minutes',
    },
    PUBLIC_KEY
  );
}
