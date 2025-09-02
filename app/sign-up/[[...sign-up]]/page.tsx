import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/app/(public)/auth-shell";
import { otakumoriClerkAppearance } from "@/app/lib/clerkTheme";

export default function Page() {
  return (
    <AuthShell>
      {/* Custom card header */}
      <div className="px-6 pt-6 pb-3 border-b border-zinc-700/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-600 to-fuchsia-700 shadow" />
          <div>
            <div className="font-semibold text-pink-300">Leave a mark</div>
            <div className="text-xs text-zinc-400">Secure • Fast • Cute (and a bit cursed)</div>
          </div>
        </div>
      </div>
      
      <SignUp 
        routing="path" 
        path="/sign-up"
        appearance={otakumoriClerkAppearance}
      />
    </AuthShell>
  );
}