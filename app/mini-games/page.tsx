import dynamic from "next/dynamic";
import DiagErrorBoundary from "@/app/components/DiagErrorBoundary";

const DiagCube = dynamic(() => import("./_components/DiagCube"), { 
  ssr: false, 
  loading: () => <div className="p-4 text-gray-300">Preparing 3D…</div> 
});

export const metadata = {
  title: "Mini-Games | Otaku-mori (Diagnostics)",
  description: "Diagnostic cube to verify WebGL rendering pipeline."
};

export default function MiniGamesDiagPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Mini-Games (Diagnostic)</h1>
      <p className="mt-2 text-sm text-gray-400">
        If you can see a spinning hot-pink cube and orbit it, the WebGL pipeline is healthy.
      </p>

      <div className="mt-6">
        <DiagErrorBoundary>
          <DiagCube />
        </DiagErrorBoundary>
      </div>

      <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-gray-300">
        <strong>What this proves:</strong> rendering works independent of Clerk/Printify/assets.
        <br />
        Next step: swap this with the real GameCube once we confirm no SSR/hydration errors.
      </section>
    </main>
  );
}
