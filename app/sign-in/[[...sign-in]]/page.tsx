import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-otm-gray to-otm-ink">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white/95 backdrop-blur-sm shadow-2xl border-0',
              headerTitle: 'text-2xl font-bold text-otm-gray',
              headerSubtitle: 'text-otm-gray-light',
              socialButtonsBlockButton: 'bg-otm-pink hover:bg-otm-pink-dark text-white',
              formButtonPrimary: 'bg-otm-pink hover:bg-otm-pink-dark text-white',
              footerActionLink: 'text-otm-pink hover:text-otm-pink-dark',
            },
          }}
          redirectUrl="/account"
        />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Sign In - Otaku-Mori',
  description: 'Sign in to your Otaku-Mori account',
  robots: 'noindex, nofollow',
};
