// DEPRECATED: This component is a duplicate. Use app\components\components\Layout.jsx instead.
import { optimusPrinceps } from '@/lib/fonts';
import '@/app/styles/game-threshold-space.css';

export default function MiniGamesLayout({ children }: { children: React.ReactNode }) {
  return <section className={optimusPrinceps.variable}>{children}</section>;
}
