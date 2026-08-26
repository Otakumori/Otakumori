import Link from 'next/link';
import { paths } from '@/lib/paths';
import HomeSoapstoneDialog from '@/app/components/home/HomeSoapstoneDialog';
import styles from './RootFooter.module.css';

const footerGroups = [
  {
    title: 'Shop',
    links: [
      { label: 'Storefront', href: paths.shop(), region: 'root-cavity-shop' },
      { label: 'Cart', href: paths.cart(), region: 'root-cavity-cart' },
      { label: 'Wishlist', href: '/wishlist', region: 'root-cavity-wishlist' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Profile', href: paths.profile(), region: 'root-cavity-profile' },
      { label: 'Account', href: paths.account(), region: 'root-cavity-account' },
      { label: 'Petal Wallet', href: '/profile/petals', region: 'root-cavity-petals' },
    ],
  },
  {
    title: 'World',
    links: [
      { label: 'Mini-Games', href: paths.games(), region: 'root-cavity-games' },
      { label: 'Blog', href: paths.blogIndex(), region: 'root-cavity-blog' },
      { label: 'Soapstones', href: paths.soapstones(), region: 'root-cavity-soapstones' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help', href: paths.help(), region: 'root-cavity-help' },
      { label: 'Privacy', href: paths.privacy(), region: 'root-cavity-privacy' },
      { label: 'Terms', href: paths.terms(), region: 'root-cavity-terms' },
      { label: 'Cookies', href: paths.cookies(), region: 'root-cavity-cookies' },
    ],
  },
];

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/Otaku-morii' },
  { label: 'Instagram', href: 'https://www.instagram.com/otakumoriii/' },
];

export default function RootFooter() {
  return (
    <footer
      className={`${styles.rootFooter} relative w-full px-0 pb-8`}
      aria-labelledby="home-root-footer-title"
      data-testid="mori-root-footer"
      data-root-footer-contract="combined-world-overlay"
      data-portrait-root-master="missing"
    >
      <div className={`${styles.contentShell} mx-auto w-full max-w-7xl px-5 pb-8 sm:px-7 md:px-8`}>
        <div className="grid gap-8 md:grid-cols-[1.05fr_1.15fr] md:items-end">
          <div data-root-region="footer-voice">
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.3em] text-[#f2bfd1]/76">
              Beneath the tree
            </p>
            <h2
              id="home-root-footer-title"
              className="font-display mt-3 max-w-xl text-2xl font-semibold text-[#fff1e4] drop-shadow-[0_3px_14px_rgba(0,0,0,0.7)] md:text-3xl"
            >
              The roots remember every path.
            </h2>
            <p className="font-body mt-3 max-w-xl text-sm leading-7 text-[#f7dcd5]/72">
              Quiet paths back to the shop, the games, the petals, and the little messages left in
              the dark.
            </p>
            <HomeSoapstoneDialog />
          </div>

          <div className="grid gap-5" data-root-region="html-navigation-cavities">
            <nav
              aria-label="Rooted homepage navigation"
              className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4"
            >
              {footerGroups.map((group) => (
                <div key={group.title} className={styles.linkGroup}>
                  <h3 className="font-ui text-[0.67rem] font-semibold uppercase tracking-[0.24em] text-[#f2bfd1]/70">
                    {group.title}
                  </h3>
                  <ul className="mt-3 grid gap-1">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          prefetch={false}
                          data-root-region={link.region}
                          className="inline-flex rounded-full px-2 py-1.5 text-[#fff4e8]/78 transition hover:bg-[#f3b3c8]/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/26"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <nav
              aria-label="Otakumori social links"
              className="flex flex-wrap justify-start gap-2 text-xs md:justify-end"
              data-root-region="social-glow-band"
            >
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#f6dcc7]/12 bg-[#080509]/20 px-3 py-2 text-[#f7dcd5]/68 transition hover:border-[#f3b3c8]/40 hover:bg-[#f3b3c8]/10 hover:text-[#fff4e8] focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/26"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div
          className="font-body mt-8 flex flex-col gap-2 border-t border-[#f6dcc7]/12 pt-5 text-xs text-[#f7dcd5]/58 sm:flex-row sm:items-center sm:justify-between"
          data-root-region="footer-legal-copy"
        >
          <p>Otaku-mori &trade; keeps a lantern lit beneath the roots.</p>
          <p>&copy; {new Date().getFullYear()} Otaku-mori. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
