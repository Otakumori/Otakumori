import { t } from '@/lib/microcopy';

export default function FooterDark() {
  return (
    <footer className="relative z-10 mx-auto mt-12 max-w-7xl px-4 pb-12 md:mt-16 md:px-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-xs text-zinc-300/90 backdrop-blur-xl">
        © {new Date().getFullYear()} {t("brand", "siteName")} • Crafted for travelers. {t("encouragement", "dontGoHollow")}
      </div>
    </footer>
  );
}
