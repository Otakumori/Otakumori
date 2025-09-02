import Link from 'next/link';

export default function WishlistLink() {
  return (
    <Link 
      href="/wishlist" 
      aria-label="Wishlist" 
      className="hover:underline underline-offset-4"
    >
      <span aria-hidden>♡</span>
      <span className="sr-only">Wishlist</span>
    </Link>
  );
}
