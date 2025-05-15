import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import Footer, { BottomLogoAndSocials } from './components/Footer'
import FloatingSoapstoneComments from './components/FloatingSoapstoneComments'
import { ClerkProvider } from '@clerk/clerk-react'
import CherryBlossomEffect from './components/CherryBlossomEffect'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Otaku-mori - Anime E-commerce & Community Hub',
  description: 'The ultimate online e-commerce playground and community hub for anime enthusiasts, gamers, and pop-culture aficionados.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider
          appearance={{
            baseTheme: 'dark',
            variables: {
              colorPrimary: '#FF2AB8',
              colorBackground: '#0a0a0a',
              colorText: '#fff',
              colorInputBackground: '#18181b',
              colorInputText: '#fff',
              colorDanger: '#ff2a6d',
              colorSuccess: '#aaffcc',
            },
            elements: {
              card: 'rounded-2xl bg-black/80 shadow-pink-400/30',
              formButtonPrimary: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg',
              headerTitle: 'text-pink-400 font-extrabold text-2xl',
              headerSubtitle: 'text-pink-200',
              socialButtonsBlockButton: 'bg-pink-900/30 hover:bg-pink-500/30',
              footerAction: 'text-pink-400 underline',
            },
          }}
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}
        >
          <CherryBlossomEffect />
          <Providers>
            {children}
            <Toaster position="bottom-right" />
            <FloatingSoapstoneComments />
            <BottomLogoAndSocials />
            <Footer />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
