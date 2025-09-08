import { SignIn } from '@clerk/nextjs';
import AuthShell from '@/app/components/auth/auth-shell';
import { otakumoriClerkAppearance } from '@/app/lib/clerkTheme';

export default function Page() {
  return (
    <AuthShell>
      {/* Custom card header */}
      <div className="px-6 pt-6 pb-3 border-b border-zinc-700/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-600 to-fuchsia-700 shadow" />
          <div>
            <div className="font-semibold text-pink-300">{<><span role='img' aria-label='emoji'>L</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>v</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>a</span>' '<span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>k</span></>}</div>
            <div className="text-xs text-zinc-400">{<><span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span>' '•' '<span role='img' aria-label='emoji'>F</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>t</span>' '•' '<span role='img' aria-label='emoji'>C</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>e</span>' '(<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>d</span>' '<span role='img' aria-label='emoji'>a</span>' '<span role='img' aria-label='emoji'>b</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>t</span>' '<span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>d</span>)</>}</div>
          </div>
        </div>
      </div>
      <SignIn routing="path" path="/sign-in" appearance={otakumoriClerkAppearance} />
    </AuthShell>
  );
}
