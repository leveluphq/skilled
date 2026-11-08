/**
 * Security Headers Middleware
 *
 * Applies OWASP-recommended security headers to HTTP responses to protect
 * against common web vulnerabilities (XSS, clickjacking, MIME sniffing, etc.)
 *
 * Usage:
 *   import { applySecurityHeaders } from 'services/server/security/headers';
 *
 *   export default function handler(req, res) {
 *     applySecurityHeaders(res);
 *     // ... rest of handler
 *   }
 */

import { NextApiResponse } from 'next';

/**
 * Content Security Policy configuration
 *
 * Allows necessary external resources while maintaining security:
 * - Stripe: checkout, payment processing
 * - Google Tag Manager: analytics
 * - Sentry: error tracking
 * - Self: application resources
 */
function buildContentSecurityPolicy(): string {
  const directives = [
    // Default: only allow resources from same origin
    "default-src 'self'",

    // Scripts: self + inline (Next.js requires 'unsafe-inline') + external integrations
    [
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Stripe
      'https://js.stripe.com',
      // Google Tag Manager
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      // Sentry
      'https://*.ingest.sentry.io',
      // Judge0 (code execution)
      'https://ce.judge0.com',
    ].join(' '),

    // Styles: self + inline (styled-components, emotion, etc.)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // Images: self + data URIs + external CDNs
    [
      "img-src 'self' data: blob:",
      'https://*.stripe.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      // User avatars from OAuth providers
      'https://avatars.githubusercontent.com',
      'https://lh3.googleusercontent.com',
      'https://graph.facebook.com',
    ].join(' '),

    // Fonts: self + Google Fonts
    "font-src 'self' data: https://fonts.gstatic.com",

    // Connect (AJAX/fetch): self + external APIs
    [
      "connect-src 'self'",
      // Stripe
      'https://api.stripe.com',
      // Google Analytics
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      // Sentry
      'https://*.ingest.sentry.io',
      // Judge0 API
      'https://ce.judge0.com',
      // Hasura GraphQL (if accessing directly from client)
      process.env.GRAPHQL_URL || '',
    ]
      .filter(Boolean)
      .join(' '),

    // Frames: Stripe checkout and payment iframes
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",

    // Object/embed: block plugins
    "object-src 'none'",

    // Base URI: restrict base tag to same origin
    "base-uri 'self'",

    // Form actions: only allow posting to self
    "form-action 'self'",

    // Frame ancestors: prevent embedding (use X-Frame-Options as fallback)
    "frame-ancestors 'none'",

    // Upgrade insecure requests in production
    ...(isProduction() ? ["upgrade-insecure-requests"] : []),
  ];

  return directives.join('; ');
}

/**
 * Permissions Policy (formerly Feature Policy)
 *
 * Restricts browser features to prevent misuse:
 * - Payment: allow for Stripe checkout
 * - Camera/Microphone: deny (not used in app)
 * - Geolocation: deny (not used in app)
 */
function buildPermissionsPolicy(): string {
  const policies = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()', // Disable FLoC tracking
    'payment=(self)', // Allow Stripe payment APIs
  ];

  return policies.join(', ');
}

/**
 * Checks if running in production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Applies comprehensive security headers to the response
 *
 * @param res - Next.js API response object
 */
export function applySecurityHeaders(res: NextApiResponse): void {
  // Content Security Policy - prevents XSS attacks
  res.setHeader('Content-Security-Policy', buildContentSecurityPolicy());

  // X-Frame-Options - prevents clickjacking attacks
  // DENY: page cannot be displayed in a frame/iframe
  res.setHeader('X-Frame-Options', 'DENY');

  // X-Content-Type-Options - prevents MIME type sniffing
  // nosniff: browser must respect Content-Type header
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection - legacy XSS filter (modern browsers use CSP)
  // 1; mode=block: enable XSS filter and block page if attack detected
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy - controls referrer information sent with requests
  // strict-origin-when-cross-origin: send full URL for same-origin, only origin for cross-origin HTTPS
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy - controls browser features
  res.setHeader('Permissions-Policy', buildPermissionsPolicy());

  // Strict-Transport-Security (HSTS) - enforces HTTPS (production only)
  // Only apply in production to avoid issues with local development
  if (isProduction()) {
    // max-age=31536000: enforce HTTPS for 1 year
    // includeSubDomains: apply to all subdomains
    // preload: eligible for browser HSTS preload list
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // X-DNS-Prefetch-Control - controls DNS prefetching
  // off: disable DNS prefetching for privacy
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // X-Download-Options - prevents IE from executing downloads in site context
  // noopen: prevent opening files directly in IE
  res.setHeader('X-Download-Options', 'noopen');

  // X-Permitted-Cross-Domain-Policies - controls Adobe Flash/PDF cross-domain policies
  // none: no cross-domain policy files allowed
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
}

/**
 * Security headers configuration summary for documentation
 */
export const SECURITY_HEADERS_CONFIG = {
  'Content-Security-Policy': {
    purpose: 'Prevents XSS attacks by controlling resource loading',
    allowedDomains: {
      stripe: 'Payment processing',
      googleTagManager: 'Analytics',
      sentry: 'Error tracking',
      judge0: 'Code execution sandbox',
      oauth: 'GitHub, Google, Facebook avatars',
    },
  },
  'X-Frame-Options': {
    purpose: 'Prevents clickjacking attacks',
    value: 'DENY',
  },
  'X-Content-Type-Options': {
    purpose: 'Prevents MIME type sniffing',
    value: 'nosniff',
  },
  'Strict-Transport-Security': {
    purpose: 'Enforces HTTPS connections',
    value: 'max-age=31536000; includeSubDomains; preload (production only)',
  },
  'Referrer-Policy': {
    purpose: 'Controls referrer information leakage',
    value: 'strict-origin-when-cross-origin',
  },
  'Permissions-Policy': {
    purpose: 'Restricts browser features',
    restrictions: 'camera, microphone, geolocation, FLoC tracking',
    allowed: 'payment APIs (Stripe)',
  },
};
