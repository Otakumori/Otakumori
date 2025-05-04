import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'

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
        <Providers>
          {children}
          <Toaster position="bottom-right" />
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
