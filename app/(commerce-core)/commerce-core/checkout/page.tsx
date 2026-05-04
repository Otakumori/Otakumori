import Link from 'next/link';
import CommerceCoreCheckoutActions from '../../../commerce-core/_components/CommerceCoreCheckoutActions';
import { commerceCoreConfig } from '../../../commerce-core/_components/config';

const signInHref = `/sign-in?redirect_url=${encodeURIComponent(commerceCoreConfig.routes.checkout)}`;

const fieldClass =
  'mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-pink-200 focus:ring-2 focus:ring-pink-200/20';

export default function CommerceCoreCheckoutPage() {
  return (
    <main className="min-h-screen bg-[#100f12] px-4 py-6 text-zinc-100 md:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link className="text-sm text-zinc-400 hover:text-pink-100" href={commerceCoreConfig.routes.cart}>
              Back to cart
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">Checkout</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Review items, confirm shipping details, and prepare the payment handoff.
            </p>
          </div>
          <Link className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-pink-200" href={signInHref}>
            Sign in to checkout
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="space-y-6">
            <CommerceCoreCheckoutActions />

            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-base font-semibold">Shipping address</h2>
                  <p className="mt-1 text-sm text-zinc-400">Use the address where the package can be received.</p>
                </div>
                <span className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300">Manual entry</span>
              </div>

              <form className="mt-5 grid gap-4 md:grid-cols-2" data-commerce-checkout-form>
                <label className="text-sm font-medium text-zinc-300 md:col-span-2">
                  Email
                  <input autoComplete="email" className={fieldClass} name="email" type="email" />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  First name
                  <input autoComplete="given-name" className={fieldClass} name="firstName" />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  Last name
                  <input autoComplete="family-name" className={fieldClass} name="lastName" />
                </label>
                <label className="text-sm font-medium text-zinc-300 md:col-span-2">
                  Address
                  <input autoComplete="shipping address-line1" className={fieldClass} name="address1" />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  City
                  <input autoComplete="shipping address-level2" className={fieldClass} name="city" />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  State
                  <input autoComplete="shipping address-level1" className={fieldClass} name="state" />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  ZIP code
                  <input autoComplete="shipping postal-code" className={fieldClass} name="postalCode" />
                </label>
                <label className="text-sm font-medium text-zinc-300">
                  Country
                  <input autoComplete="shipping country" className={fieldClass} defaultValue="US" name="country" />
                </label>
              </form>

              <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm leading-6 text-zinc-300">
                Address correction and deliverability checks should be wired in the Stripe Tax branch with a provider-backed address validation service.
              </div>
            </section>
          </div>

          <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 lg:sticky lg:top-6">
            <h2 className="text-base font-semibold">Checkout status</h2>
            <ol className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-pink-200 text-xs font-bold text-zinc-950">1</span>
                <span className="text-zinc-300">Sign in before final payment handoff.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">2</span>
                <span className="text-zinc-300">Confirm a deliverable shipping address.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">3</span>
                <span className="text-zinc-300">Stripe Checkout, tax, and ledger rows are next-branch work.</span>
              </li>
            </ol>
          </section>
        </div>
      </section>
    </main>
  );
}
