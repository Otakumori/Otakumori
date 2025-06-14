'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const errorMessages: { [key: string]: string } = {
    OAuthSignin: 'Error starting sign in process',
    OAuthCallback: 'Error during sign in callback',
    OAuthCreateAccount: 'Error creating account',
    EmailCreateAccount: 'Error creating email account',
    Callback: 'Error during callback',
    OAuthAccountNotLinked: 'Email already exists with different provider',
    EmailSignin: 'Error sending email',
    CredentialsSignin: 'Invalid credentials',
    SessionRequired: 'Please sign in to access this page',
    Default: 'Unable to sign in',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Authentication Error
          </h2>
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">
              {error ? errorMessages[error] || errorMessages.Default : errorMessages.Default}
            </span>
          </div>
        </div>
        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 