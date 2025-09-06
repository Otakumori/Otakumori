// DEPRECATED: This component is a duplicate. Use app\components\components\Layout.jsx instead.
import { optimusPrinceps } from '@/lib/fonts';

export default function MiniGamesLayout({ children }: { children: React.ReactNode }) {
  return <section className={optimusPrinceps.variable}>{children}</section>;
}
