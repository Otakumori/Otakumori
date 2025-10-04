import microcopy from '@/content/microcopy.json';

export default function FooterNew() {
  return (
    <footer className="border-t border-white/5 mt-16">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-10 text-sm text-muted">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p>
            © {new Date().getFullYear()} {microcopy.brand.siteName}. All petals reserved.
          </p>
          <div className="flex gap-4">
            <a className="hover:text-fg" href="/privacy">
              Privacy
            </a>
            <a className="hover:text-fg" href="/cookies">
              Cookies
            </a>
            <a className="hover:text-fg" href="/contact">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
