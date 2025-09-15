import { t } from '@/lib/microcopy';

export default function FooterDark() {
  return (
    <footer className="relative z-10 mx-auto mt-12 max-w-7xl px-4 pb-12 md:mt-16 md:px-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-xs text-zinc-300/90 backdrop-blur-xl">
        {
          <>
            ''
            <span role="img" aria-label="emoji">
              ©
            </span>
            ' '''
          </>
        }
        {new Date().getFullYear()} {t('brand', 'siteName')}
        {
          <>
            ''' '•' '
            <span role="img" aria-label="emoji">
              C
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              f
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              d
            </span>
            ' '
            <span role="img" aria-label="emoji">
              f
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            ' '
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              v
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              l
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            .' '''
          </>
        }
        {t('encouragement', 'dontGoHollow')}
      </div>
    </footer>
  );
}
