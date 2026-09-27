// Compatibility endpoint: all checkout-session requests use the canonical transaction flow.
export const maxDuration = 10;
export { POST, runtime } from '@/app/api/v1/checkout/session/route';
