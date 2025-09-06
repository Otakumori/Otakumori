// DEPRECATED: This component is a duplicate. Use app\components\components\Layout.jsx instead.
import { Inter } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import { MessageProvider } from './context/MessageContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Otaku-m',
  description: 'Your ultimate anime merchandise destination',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <MessageProvider>{children}</MessageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
