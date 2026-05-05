import { headers } from 'next/headers';
import ClerkProviderWrapper from '../providers/ClerkProviderWrapper';
import FullAppShell from '../FullAppShell';
import AbyssClientLayout from './AbyssClientLayout';

export default async function AbyssLayout({ children }) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;

  return (
    <ClerkProviderWrapper nonce={nonce}>
      <FullAppShell>
        <AbyssClientLayout>{children}</AbyssClientLayout>
      </FullAppShell>
    </ClerkProviderWrapper>
  );
}
