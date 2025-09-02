// Simple script to test Clerk configuration
console.log('=== Clerk Environment Check ===');
console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'NOT SET');
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);

// Check if keys look valid
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

if (publishableKey) {
  console.log('Publishable key starts with:', publishableKey.substring(0, 10) + '...');
  console.log('Publishable key format valid:', publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_'));
}

if (secretKey) {
  console.log('Secret key starts with:', secretKey.substring(0, 10) + '...');
  console.log('Secret key format valid:', secretKey.startsWith('sk_test_') || secretKey.startsWith('sk_live_'));
}

console.log('=== End Check ===');
