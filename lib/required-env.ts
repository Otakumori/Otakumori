['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY', 'NEXT_PUBLIC_URL'].forEach((k) => {
  if (!process.env[k]) console.warn(`⚠ Missing ${k}`);
});
