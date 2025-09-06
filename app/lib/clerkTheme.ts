export const otakumoriClerkAppearance = {
  variables: {
    colorPrimary: '#ec4899',
    colorBackground: 'rgba(24,24,27,0.75)',
    colorText: '#f9fafb',
    borderRadius: '1rem',
    fontFamily: 'Roboto Condensed, ui-sans-serif, system-ui, -apple-system',
    colorInputBackground: 'rgba(39,39,42,0.8)',
    colorInputText: '#f4f4f5',
    colorInputBorder: 'rgba(244,114,182,0.5)',
  },
  elements: {
    header: 'hidden', // hide Clerk's default header
    card: 'rounded-3xl border border-pink-500/40 bg-zinc-900/70 backdrop-blur-xl shadow-[0_10px_50px_rgba(236,72,153,0.35)]',
    formFieldLabel: 'text-xs font-medium text-zinc-300',
    formFieldInput:
      'h-11 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 text-zinc-100 placeholder:text-zinc-500 focus:ring-4 focus:ring-pink-500/25 focus:border-pink-500',
    formButtonPrimary:
      'cl-formButtonPrimary h-11 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-700 font-bold text-white tracking-wide hover:scale-[1.02] transition',
    socialButtons:
      'grid grid-cols-3 gap-3 [&>button]:rounded-xl [&>button]:border [&>button]:border-zinc-700 [&>button]:bg-zinc-800/80 [&>button:hover]:bg-zinc-700/80',
    dividerText: 'text-xs text-zinc-400 bg-zinc-900/70 px-2 rounded-full',
    dividerLine: 'bg-zinc-700/60',
    footer: 'bg-transparent border-0 mt-2 text-center',
  },
  layout: { socialButtonsVariant: 'blockButton', shimmer: true },
} as const;

export const otakumoriClerkLocalization = {
  signIn: {
    start: {
      title: 'Welcome home, wanderer',
      subtitle: '', // none
    },
    form: {
      fieldLabel__emailAddress: 'Email',
      fieldLabel__password: 'Password',
      // Placeholders:
      fieldPlaceholder__emailAddress: "It's-a-Me@email.com",
      fieldPlaceholder__password: '"key_in_another_castle"',
    },
  },
  signUp: {
    start: {
      title: 'Welcome home, wanderer',
      subtitle: '', // none
    },
    form: {
      fieldLabel__emailAddress: 'Email',
      fieldLabel__password: 'Password',
      // Placeholders:
      fieldPlaceholder__emailAddress: "It's-a-Me@email.com",
      fieldPlaceholder__password: '"key_in_another_castle"',
    },
  },
} as const;
