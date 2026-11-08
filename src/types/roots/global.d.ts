declare namespace NodeJS {
  interface Process {
    browser: boolean;
  }

  interface Global {
    fetch: any;
  }
}

declare global {
  interface Window {
    Stripe?: stripe.Stripe;
  }
}

declare module '*.svg';

